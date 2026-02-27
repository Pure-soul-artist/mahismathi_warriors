import asyncio, aiosqlite

items = [
    ("Johnnie Walker Black", "liquor", 15, 20, 100, "bottles"),
    ("Hendricks Gin", "liquor", 8, 15, 60, "bottles"),
    ("Champagne Moet", "liquor", 5, 10, 50, "bottles"),
    ("Orange Juice", "beverage", 30, 40, 150, "cartons"),
    ("Mineral Water", "beverage", 50, 60, 200, "bottles"),
    ("Mixed Nuts", "food", 20, 25, 100, "units"),
    # ... add more
]

async def seed():
    async with aiosqlite.connect("inventory.db") as db:
        await db.executemany(
            "INSERT INTO inventory_items (name, category, current_stock, base_threshold, max_capacity, unit) VALUES (?,?,?,?,?,?)",
            items
        )
        await db.commit()

asyncio.run(seed())