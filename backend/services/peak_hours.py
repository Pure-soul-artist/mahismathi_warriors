from datetime import datetime

# Define peak flight windows (24hr format)
PEAK_WINDOWS = [
    (6, 9),    # Morning rush — early flights
    (11, 14),  # Midday peak
    (17, 21),  # Evening — most flights depart
]

def is_peak_hour() -> bool:
    hour = datetime.now().hour
    return any(start <= hour < end for start, end in PEAK_WINDOWS)

def get_effective_threshold(base_threshold: int) -> int:
    """
    During peak hours, reorder 50% earlier than normal.
    E.g. base_threshold=20 → effective=30 during peak.
    This means the agent catches low stock BEFORE the rush hits.
    """
    return int(base_threshold * 1.5) if is_peak_hour() else base_threshold