from datetime import datetime

PEAK_WINDOWS = [
    (6, 9),    # Morning rush
    (11, 14),  # Midday
    (17, 21),  # Evening peak
]

def is_peak_hour() -> bool:
    current_hour = datetime.now().hour
    return any(start <= current_hour < end for start, end in PEAK_WINDOWS)

def get_effective_threshold(base_threshold: int) -> int:
    """During peak hours, trigger reorder at 1.5x the normal threshold."""
    if is_peak_hour():
        return int(base_threshold * 1.5)
    return base_threshold