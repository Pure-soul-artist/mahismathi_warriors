from fastapi import APIRouter, HTTPException, Body
import aiosqlite
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "inventory.db")

router = APIRouter()

@router.get("/")
async def get_all():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        rows = await db.execute_fetchall("SELECT * FROM inventory_items ORDER BY status DESC")
        return [dict(r) for r in rows]

@router.post("/")
async def add_item(item: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO inventory_items (name,category,current_stock,base_threshold,max_capacity,unit) VALUES (?,?,?,?,?,?)",
            (item["name"], item["category"], item["current_stock"], item["base_threshold"], item["max_capacity"], item["unit"])
        )
        await db.commit()
    return {"message": "Item added"}

@router.put("/{item_id}")
async def update_stock(item_id: int, current_stock: int = Body(..., embed=True)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        item = await (await db.execute(
            "SELECT * FROM inventory_items WHERE id=?", (item_id,)
        )).fetchone()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        base = item["base_threshold"]

        if current_stock <= base // 2:
            new_status = "critical"
        elif current_stock <= base:
            new_status = "low"
        else:
            new_status = "ok"

        await db.execute(
            """UPDATE inventory_items 
               SET current_stock = ?,
                   status = ?,
                   last_updated = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (current_stock, new_status, item_id)
        )
        await db.commit()

    return {"message": "Stock updated", "new_status": new_status}

@router.delete("/{item_id}")
async def delete_item(item_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM inventory_items WHERE id=?", (item_id,))
        await db.commit()
    return {"message": "Deleted"}
