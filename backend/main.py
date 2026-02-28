from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import inventory, orders, chat
from scheduler import start_scheduler

app = FastAPI(title="Inventory Replenishment Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()
    start_scheduler()

app.include_router(inventory.router, prefix="/inventory")
app.include_router(orders.router, prefix="/orders")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def root():
    return {"status": "Inventory Agent Running"}