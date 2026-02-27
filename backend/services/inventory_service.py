from peak_hours import get_effective_threshold, is_peak_hour
import aiosqlite
from database import DB_PATH

async def check_and_trigger_reorders():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        items = await db.execute_fetchall("SELECT * FROM inventory_items")
        
        for item in items:
            effective_threshold = get_effective_threshold(item["base_threshold"])
            
            if item["current_stock"] <= effective_threshold:
                # Check if pending order already exists
                existing = await db.execute(
                    "SELECT id FROM restock_orders WHERE item_id=? AND status='pending'",
                    (item["id"],)
                )
                if await existing.fetchone():
                    continue   # Don't double-order
                
                quantity = item["max_capacity"] - item["current_stock"]
                peak = is_peak_hour()
                
                # Insert order
                await db.execute("""
                    INSERT INTO restock_orders (item_id, item_name, quantity_ordered, triggered_by, is_peak_hour)
                    VALUES (?, ?, ?, 'auto', ?)
                """, (item["id"], item["name"], quantity, int(peak)))
                
                # Update item status
                status = "critical" if item["current_stock"] <= item["base_threshold"] // 2 else "low"
                await db.execute("UPDATE inventory_items SET status=? WHERE id=?", (status, item["id"]))
                await db.commit()
                
                # Send email
                from email_service import send_restock_email
                await send_restock_email(item["name"], quantity, peak)