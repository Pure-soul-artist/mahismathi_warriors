from fastapi import APIRouter
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
        await db.execute("UPDATE restock_orders SET status='fulfilled' WHERE id=?", (order_id,))
        await db.commit()
    return {"message": "Marked fulfilled"}
