from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, auto_seed
from routes import inventory, orders, chat
from scheduler import start_scheduler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mahismathi-warriors.vercel.app/,"
        "http://localhost:5173",
    ],   # tighten this to your Vercel URL before demo
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()
    await auto_seed()
    start_scheduler()

app.include_router(inventory.router, prefix="/inventory")
app.include_router(orders.router, prefix="/orders")
app.include_router(chat.router, prefix="/chat")
