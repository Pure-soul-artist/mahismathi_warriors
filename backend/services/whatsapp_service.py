import os
from twilio.rest import Client
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
load_dotenv(dotenv_path)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
WHATSAPP_TO = os.getenv("WHATSAPP_TO")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

def send_whatsapp_alert(item_name: str, quantity: int, is_peak: bool) -> bool:
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not WHATSAPP_TO:
        print(f"[WHATSAPP SKIPPED] Restock: {item_name} x{quantity} {'PEAK' if is_peak else ''}")
        return False
        
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        peak_tag = " *PEAK HOURS - URGENT*" if is_peak else ""
        body = f"📦 *Restock Alert*{peak_tag}\n\n*Item:* {item_name}\n*Quantity:* {quantity}\n*Priority:* {'HIGH' if is_peak else 'Normal'}"
        
        to_number = WHATSAPP_TO if WHATSAPP_TO.startswith('whatsapp:') else f"whatsapp:{WHATSAPP_TO}"

        message = client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            body=body,
            to=to_number
        )
        print(f"WhatsApp sent for {item_name}. SID: {message.sid}")
        return True
    except Exception as e:
        print(f"WhatsApp failed: {e}")
        return False
