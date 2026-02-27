import os
from dotenv import load_dotenv
load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
WAREHOUSE_EMAIL = os.getenv("WAREHOUSE_EMAIL")
DB_PATH = "inventory.db"