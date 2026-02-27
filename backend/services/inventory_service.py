import aiosqlite
import os
from services.peak_hours import get_effective_threshold
from services.order_service import create_order

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "inventory.db")

async def check_and_trigger_reorders():
    print("Scheduler tick — checking inventory...")
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        items = await db.execute_fetchall("SELECT * FROM inventory_items")

    for item in items:
        effective = get_effective_threshold(item["base_threshold"])
        stock = item["current_stock"]

        if stock <= item["base_threshold"] // 2:
            new_status = "critical"
        elif stock <= effective:
            new_status = "low"
        else:
            new_status = "ok"

        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("UPDATE inventory_items SET status=? WHERE id=?", (new_status, item["id"]))
            await db.commit()

        if stock <= effective:
            await create_order(item["id"], triggered_by="auto")
