import aiosmtplib
from email.mime.text import MIMEText
import os

async def send_restock_email(item_name, quantity, is_peak):
    peak_note = " [PEAK HOURS - URGENT]" if is_peak else ""
    body = f"""
    RESTOCK ORDER{peak_note}
    
    Item: {item_name}
    Quantity Needed: {quantity}
    Priority: {"HIGH - Peak flight hours active" if is_peak else "Normal"}
    
    Please dispatch to Airport Lounge immediately.
    """
    msg = MIMEText(body)
    msg["Subject"] = f"Restock Request: {item_name}{peak_note}"
    msg["From"] = os.getenv("EMAIL_SENDER")
    msg["To"] = os.getenv("WAREHOUSE_EMAIL")
    
    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        username=os.getenv("EMAIL_SENDER"),
        password=os.getenv("EMAIL_PASSWORD"),
    )