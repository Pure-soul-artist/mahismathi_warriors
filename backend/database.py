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
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()