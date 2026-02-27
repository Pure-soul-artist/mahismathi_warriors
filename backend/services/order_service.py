import aiosqlite
import os
from services.peak_hours import is_peak_hour
from services.email_service import send_restock_email

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "inventory.db")

async def create_order(item_id: int, triggered_by: str = "auto"):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        item = await (await db.execute("SELECT * FROM inventory_items WHERE id=?", (item_id,))).fetchone()
        if not item:
            return None

        existing = await (await db.execute(
            "SELECT id FROM restock_orders WHERE item_id=? AND status='pending'", (item_id,)
        )).fetchone()
        if existing and triggered_by == "auto":
            return None

        quantity = item["max_capacity"] - item["current_stock"]
        peak = is_peak_hour()

        await db.execute("""
            INSERT INTO restock_orders (item_id, item_name, quantity_ordered, triggered_by, is_peak_hour)
            VALUES (?, ?, ?, ?, ?)
        """, (item_id, item["name"], quantity, triggered_by, int(peak)))
        await db.commit()

        await send_restock_email(item["name"], quantity, peak)
        return quantity
