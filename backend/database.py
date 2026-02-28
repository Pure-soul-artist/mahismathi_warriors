import aiosqlite
from config import DB_PATH

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS inventory_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                current_stock INTEGER NOT NULL,
                base_threshold INTEGER NOT NULL,
                max_capacity INTEGER NOT NULL,
                unit TEXT NOT NULL,
                status TEXT DEFAULT 'ok',
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS restock_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER,
                item_name TEXT NOT NULL,
                quantity_ordered INTEGER NOT NULL,
                triggered_by TEXT DEFAULT 'auto',
                is_peak_hour INTEGER DEFAULT 0,
                email_sent INTEGER DEFAULT 0,
                status TEXT DEFAULT 'pending',
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

        row = await (await db.execute("SELECT COUNT(*) FROM inventory_items")).fetchone()
        if row[0] > 0:
            print(f"DB already has {row[0]} items, skipping seed.")
            return

        items = [
            ("Johnnie Walker Black", "liquor", 15, 20, 100, "bottles"),
            ("Hendricks Gin", "liquor", 8, 15, 60, "bottles"),
            ("Moet Champagne", "liquor", 4, 10, 50, "bottles"),
            ("Absolut Vodka", "liquor", 6, 12, 80, "bottles"),
            ("Jack Daniels", "liquor", 18, 20, 90, "bottles"),
            ("Orange Juice", "beverage", 30, 40, 150, "cartons"),
            ("Mineral Water", "beverage", 55, 60, 200, "bottles"),
            ("Coca Cola", "beverage", 20, 30, 120, "cans"),
            ("Tonic Water", "beverage", 10, 20, 80, "cans"),
            ("Red Bull", "beverage", 5, 15, 60, "cans"),
            ("Mixed Nuts", "food", 12, 25, 100, "units"),
            ("Croissants", "food", 8, 20, 60, "units"),
            ("Cheese Platter", "food", 3, 10, 30, "units"),
            ("Fruit Basket", "food", 5, 10, 40, "units"),
            ("Sandwich Platter", "food", 6, 15, 50, "units"),
        ]

        await db.executemany(
            """INSERT INTO inventory_items
               (name, category, current_stock, base_threshold, max_capacity, unit)
               VALUES (?,?,?,?,?,?)""",
            items
        )
        await db.commit()
        print(f"✅ Seeded {len(items)} items successfully.")
    async with aiosqlite.connect(DB_PATH) as db:
        # Only seed if table is empty — won't duplicate on restart
        row = await (await db.execute("SELECT COUNT(*) FROM inventory_items")).fetchone()
        if row[0] > 0:
            print("DB already seeded, skipping.")
            return

        items = [
            ("Johnnie Walker Black", "liquor", 15, 20, 100, "bottles"),
            ("Hendricks Gin", "liquor", 8, 15, 60, "bottles"),
            ("Moet Champagne", "liquor", 4, 10, 50, "bottles"),
            ("Absolut Vodka", "liquor", 6, 12, 80, "bottles"),
            ("Jack Daniels", "liquor", 18, 20, 90, "bottles"),
            ("Orange Juice", "beverage", 30, 40, 150, "cartons"),
            ("Mineral Water", "beverage", 55, 60, 200, "bottles"),
            ("Coca Cola", "beverage", 20, 30, 120, "cans"),
            ("Tonic Water", "beverage", 10, 20, 80, "cans"),
            ("Red Bull", "beverage", 5, 15, 60, "cans"),
            ("Mixed Nuts", "food", 12, 25, 100, "units"),
            ("Croissants", "food", 8, 20, 60, "units"),
            ("Cheese Platter", "food", 3, 10, 30, "units"),
            ("Fruit Basket", "food", 5, 10, 40, "units"),
            ("Sandwich Platter", "food", 6, 15, 50, "units"),
        ]

        await db.executemany(
            """INSERT INTO inventory_items 
               (name, category, current_stock, base_threshold, max_capacity, unit) 
               VALUES (?,?,?,?,?,?)""",
            items
        )
        await db.commit()
        print(f"Seeded {len(items)} items.")