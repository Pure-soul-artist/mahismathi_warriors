from fastapi import APIRouter, HTTPException
import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "inventory.db")

router = APIRouter()

@router.get("/")
async def get_orders():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        rows = await db.execute_fetchall(
            "SELECT * FROM restock_orders ORDER BY triggered_at DESC"
        )
        return [dict(r) for r in rows]

@router.post("/manual/{item_id}")
async def manual_order(item_id: int):
    from services.order_service import create_order
    await create_order(item_id, triggered_by="manual")
    return {"message": "Manual order placed"}

@router.put("/{order_id}/fulfill")
async def fulfill_order(order_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        # Get the order details first
        order = await (await db.execute(
            "SELECT * FROM restock_orders WHERE id=?", (order_id,)
        )).fetchone()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order["status"] == "fulfilled":
            raise HTTPException(status_code=400, detail="Order already fulfilled")
        
        # Mark order as fulfilled
        await db.execute(
            "UPDATE restock_orders SET status='fulfilled' WHERE id=?",
            (order_id,)
        )
        
        # Add the ordered quantity back to inventory
        await db.execute(
            """UPDATE inventory_items 
               SET current_stock = current_stock + ?,
                   last_updated = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (order["quantity_ordered"], order["item_id"])
        )
        
        # Recalculate status after stock update
        item = await (await db.execute(
            "SELECT * FROM inventory_items WHERE id=?", (order["item_id"],)
        )).fetchone()
        
        if item:
            stock = item["current_stock"]
            base = item["base_threshold"]
            if stock <= base // 2:
                new_status = "critical"
            elif stock <= base:
                new_status = "low"
            else:
                new_status = "ok"
            
            await db.execute(
                "UPDATE inventory_items SET status=? WHERE id=?",
                (new_status, item["id"])
            )
        
        await db.commit()
    
    return {"message": "Order fulfilled and inventory updated"}
