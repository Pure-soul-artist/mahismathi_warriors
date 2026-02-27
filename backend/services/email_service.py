import os

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
WAREHOUSE_EMAIL = os.getenv("WAREHOUSE_EMAIL")

async def send_restock_email(item_name: str, quantity: int, is_peak: bool):
    if not EMAIL_SENDER or not WAREHOUSE_EMAIL:
        print(f"[EMAIL SKIPPED] Restock: {item_name} x{quantity} {'PEAK' if is_peak else ''}")
        return
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        peak_tag = " PEAK HOURS - URGENT" if is_peak else ""
        body = f"Restock Order{peak_tag}\n\nItem: {item_name}\nQuantity: {quantity}\nPriority: {'HIGH' if is_peak else 'Normal'}"
        msg = MIMEText(body)
        msg["Subject"] = f"Restock: {item_name}{peak_tag}"
        msg["From"] = EMAIL_SENDER
        msg["To"] = WAREHOUSE_EMAIL
        await aiosmtplib.send(msg, hostname="smtp.gmail.com", port=587,
                              username=EMAIL_SENDER, password=EMAIL_PASSWORD, start_tls=True)
        print(f"Email sent for {item_name}")
    except Exception as e:
        print(f"Email failed: {e}")
