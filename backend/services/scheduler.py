from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.inventory_service import check_and_trigger_reorders

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_and_trigger_reorders, "interval", seconds=60)
    scheduler.start()