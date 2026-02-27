from fastapi import APIRouter
import aiosqlite
import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "inventory.db")
router = APIRouter()

async def get_inventory_context():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        items  = await db.execute_fetchall("SELECT * FROM inventory_items ORDER BY status DESC")
        orders = await db.execute_fetchall("SELECT * FROM restock_orders ORDER BY triggered_at DESC LIMIT 20")

        items_text = "\n".join([
            f"- {i['name']} ({i['category']}): {i['current_stock']} {i['unit']} | threshold: {i['base_threshold']} | max: {i['max_capacity']} | status: {i['status'].upper()}"
            for i in items
        ])
        orders_text = "\n".join([
            f"- {o['item_name']}: qty {o['quantity_ordered']} | {o['triggered_by']} | peak: {'yes' if o['is_peak_hour'] else 'no'} | status: {o['status']} | time: {o['triggered_at']}"
            for o in orders
        ]) or "No orders yet."

        low_items      = [i for i in items if i['status'] in ('low', 'critical')]
        critical_items = [i for i in items if i['status'] == 'critical']

        return {
            "items_text":     items_text,
            "orders_text":    orders_text,
            "total":          len(items),
            "low_count":      len(low_items),
            "critical_count": len(critical_items),
            "low_names":      [i['name'] for i in low_items],
            "critical_names": [i['name'] for i in critical_items],
        }

def is_peak_hour():
    h = datetime.now().hour
    return (6 <= h < 9) or (11 <= h < 14) or (17 <= h < 21)

def build_system_prompt(ctx, peak, now):
    return f"""You are an intelligent airport lounge inventory assistant for the Lounge Control system.
You have LIVE access to the current inventory. Answer clearly, concisely and helpfully.

=== LIVE INVENTORY STATUS ===
Time: {now}
Peak Hours Active: {'YES ⚡' if peak else 'No'}
Total Items: {ctx['total']} | Low: {ctx['low_count']} | Critical: {ctx['critical_count']}

FULL INVENTORY:
{ctx['items_text']}

RECENT ORDERS (last 20):
{ctx['orders_text']}

RULES:
- Be direct and data-driven using real numbers from above
- Keep it concise (2-5 sentences unless listing items)
- Use ✅ ok, ⚠️ low, 🔴 critical, ⚡ peak hours
- Peak windows: 6-9 AM, 11 AM-2 PM, 5-9 PM (threshold ×1.5 during peaks)
- For override/cancel requests: tell manager to use the Orders tab → mark Fulfilled
"""

@router.post("/chat")
async def chat(body: dict):
    user_message = body.get("message", "").strip()
    if not user_message:
        return {"reply": "Please ask me something about the inventory."}

    ctx  = await get_inventory_context()
    peak = is_peak_hour()
    now  = datetime.now().strftime("%I:%M %p, %A %d %b %Y")

    # Try Anthropic first, fall back to OpenAI
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    openai_key    = os.environ.get("OPENAI_API_KEY", "").strip()

    system_prompt = build_system_prompt(ctx, peak, now)

    # ── ANTHROPIC ──────────────────────────────────────────────
    if anthropic_key:
        print(f"[CHAT] Using Anthropic | key prefix: {anthropic_key[:12]}")
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key":         anthropic_key,
                        "anthropic-version": "2023-06-01",
                        "content-type":      "application/json",
                    },
                    json={
                        "model":      "claude-haiku-4-5",
                        "max_tokens": 500,
                        "system":     system_prompt,
                        "messages":   [{"role": "user", "content": user_message}],
                    }
                )
                print(f"[CHAT] Anthropic status: {response.status_code}")
                if response.status_code == 200:
                    return {"reply": response.json()["content"][0]["text"]}
                else:
                    err = response.json().get("error", {}).get("message", "Unknown")
                    print(f"[CHAT] Anthropic error: {err}")
        except Exception as e:
            print(f"[CHAT] Anthropic exception: {e}")

    # ── OPENAI ─────────────────────────────────────────────────
    if openai_key:
        print(f"[CHAT] Using OpenAI | key prefix: {openai_key[:12]}")
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type":  "application/json",
                    },
                    json={
                        "model":      "gpt-3.5-turbo",
                        "max_tokens": 500,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user",   "content": user_message},
                        ],
                    }
                )
                print(f"[CHAT] OpenAI status: {response.status_code}")
                if response.status_code == 200:
                    return {"reply": response.json()["choices"][0]["message"]["content"]}
                else:
                    err = response.json().get("error", {}).get("message", "Unknown")
                    print(f"[CHAT] OpenAI error: {err}")
                    if "quota" in err.lower() or "billing" in err.lower():
                        return {"reply": "💳 OpenAI quota exceeded. Please add an ANTHROPIC_API_KEY to your .env file as a free alternative. Get one at console.anthropic.com"}
        except Exception as e:
            print(f"[CHAT] OpenAI exception: {e}")

    # ── SMART FALLBACK (no API needed) ─────────────────────────
    print("[CHAT] Using smart fallback (no API key working)")
    msg = user_message.lower()
    if any(w in msg for w in ["low", "running low", "shortage", "need"]):
        if ctx['low_names']:
            reply = f"⚠️ {ctx['low_count']} items running low: {', '.join(ctx['low_names'][:6])}."
            if ctx['critical_names']:
                reply += f"\n🔴 Critical: {', '.join(ctx['critical_names'])}. Immediate restocking needed!"
        else:
            reply = "✅ All items are currently well-stocked!"
    elif any(w in msg for w in ["critical", "urgent", "emergency"]):
        if ctx['critical_names']:
            reply = f"🔴 {ctx['critical_count']} critical items: {', '.join(ctx['critical_names'])}. Auto-restock orders triggered."
        else:
            reply = "✅ No critical items right now. All stock levels are healthy."
    elif any(w in msg for w in ["peak", "tonight", "evening", "ready", "beer", "wine", "enough"]):
        if peak:
            reply = f"⚡ PEAK HOURS ACTIVE. {ctx['critical_count']} critical, {ctx['low_count']} low stock items. Dispatching urgently."
        else:
            reply = f"Next peak at 5 PM. Currently {ctx['low_count']} items are low. {'⚠️ Recommend restocking before peak.' if ctx['low_count'] > 0 else '✅ Stock looks good for peak hours.'}"
    elif any(w in msg for w in ["order", "restock", "placed", "today"]):
        reply = f"📦 Check the Orders tab for all restock history. {ctx['low_count']} items currently need restocking."
    elif any(w in msg for w in ["summary", "overview", "status", "update", "stock"]):
        reply = f"📊 {ctx['total']} total items tracked.\n⚠️ Low: {ctx['low_count']} — {', '.join(ctx['low_names'][:4]) or 'none'}\n🔴 Critical: {ctx['critical_count']} — {', '.join(ctx['critical_names']) or 'none'}\n⚡ Peak hours: {'ACTIVE' if peak else 'Not active'}"
    elif any(w in msg for w in ["champagne", "whiskey", "vodka", "rum", "gin", "beer", "wine", "juice", "water"]):
        # Find the specific item
        for item_line in ctx['items_text'].split('\n'):
            if any(w in msg for w in item_line.lower().split()):
                reply = f"📦 {item_line.strip()}"
                break
        else:
            reply = f"I couldn't find that specific item. Check the Inventory tab for all {ctx['total']} items."
    else:
        reply = f"📊 Live status: {ctx['total']} items | ⚠️ {ctx['low_count']} low | 🔴 {ctx['critical_count']} critical | ⚡ Peak: {'YES' if peak else 'No'}\n\nTry asking: 'What's running low?' or 'Are we ready for peak hours?'"

    return {"reply": reply}