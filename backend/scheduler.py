from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.inventory_service import check_and_trigger_reorders

def start_scheduler():
    scheduler = AsyncIOScheduler()
    # Runs every 60 seconds automatically
    scheduler.add_job(
        check_and_trigger_reorders,
        "interval",
        seconds=60,
        id="inventory_check",
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler started — checking every 60 seconds")