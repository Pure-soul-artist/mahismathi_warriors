from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.inventory_service import check_and_trigger_reorders

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        check_and_trigger_reorders,
        "interval",
        seconds=60,
        id="inventory_check",
        replace_existing=True,
        max_instances=3,          # ← allow overlap instead of skipping
        misfire_grace_time=30     # ← if it misses by <30s, still run it
    )
    scheduler.start()
    print("Scheduler started — checking every 60 seconds")