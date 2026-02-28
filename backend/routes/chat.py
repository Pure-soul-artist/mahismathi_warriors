from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import aiosqlite
from groq import Groq
from config import GROQ_API_KEY, DB_PATH
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

def build_system_prompt(inventory: list, orders: list) -> str:
    inv_lines = []
    for item in inventory:
        inv_lines.append(
            f"  - [{item['status'].upper()}] {item['name']} (Category: {item['category']}) | "
            f"Stock: {item['current_stock']} {item['unit']} | "
            f"Threshold: {item['base_threshold']} | "
            f"Max Capacity: {item['max_capacity']} | "
            f"Last Updated: {item.get('last_updated', 'N/A')}"
        )
    inventory_text = "\n".join(inv_lines) if inv_lines else "  No inventory items found."

    pending  = sum(1 for o in orders if o['status'] == 'pending')
    fulfilled = sum(1 for o in orders if o['status'] == 'fulfilled')
    recent_orders = orders[:10]

    order_lines = []
    for o in recent_orders:
        order_lines.append(
            f"  - Order #{o['id']}: {o['item_name']} | Qty: {o['quantity_ordered']} | "
            f"Status: {o['status']} | Triggered by: {o['triggered_by']} | "
            f"Peak Hour: {'Yes' if o['is_peak_hour'] else 'No'} | Time: {o.get('triggered_at', 'N/A')}"
        )
    orders_text = "\n".join(order_lines) if order_lines else "  No orders found."

    critical = [i['name'] for i in inventory if i['status'] == 'critical']
    low      = [i['name'] for i in inventory if i['status'] == 'low']
    ok_items = [i['name'] for i in inventory if i['status'] == 'ok']

    return f"""You are an AI assistant for the Airport Lounge Inventory Management System — an automated restocking system for an airport lounge.
Help staff get quick answers about inventory, orders, and system operations. Be concise, friendly, and precise.

=== SYSTEM OVERVIEW ===
- Monitors airport lounge inventory (food, beverages, amenities, etc.)
- Automatically triggers restock orders when stock falls below thresholds
- Peak hours trigger more aggressive restocking thresholds
- Emails sent to warehouse when restocking is needed
- Staff can also manually place orders

=== LIVE INVENTORY DATA ===
{inventory_text}

=== STOCK SUMMARY ===
- Critical (immediate action needed): {', '.join(critical) if critical else 'None ✅'}
- Low stock: {', '.join(low) if low else 'None ✅'}
- OK: {', '.join(ok_items) if ok_items else 'None'}

=== RECENT RESTOCK ORDERS (last 10) ===
{orders_text}

=== ORDER SUMMARY ===
- Pending: {pending} | Fulfilled: {fulfilled} | Total: {len(orders)}

Answer using live data above. Use bullet points for lists. Keep responses concise.
"""

@router.post("/")
async def chat(request: ChatRequest):
    """Streaming chat endpoint — returns AI tokens as Server-Sent Events."""
    try:
        # Fetch fresh live data from SQLite every request
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            inv_rows   = await db.execute_fetchall("SELECT * FROM inventory_items ORDER BY status DESC")
            order_rows = await db.execute_fetchall("SELECT * FROM restock_orders ORDER BY triggered_at DESC")
            inventory  = [dict(r) for r in inv_rows]
            orders     = [dict(r) for r in order_rows]

        system_prompt = build_system_prompt(inventory, orders)
        client = Groq(api_key=GROQ_API_KEY)

        def generate():
            try:
                stream = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": request.message},
                    ],
                    max_tokens=500,
                    temperature=0.4,
                    stream=True,
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        # Send each token as a Server-Sent Event
                        yield f"data: {json.dumps({'token': delta})}\n\n"
                # Signal completion
                yield "data: [DONE]\n\n"
            except Exception as e:
                err = str(e)
                if "429" in err or "rate" in err.lower():
                    yield f"data: {json.dumps({'token': '⚠️ Rate limit hit. Please wait a moment and try again.'})}\n\n"
                else:
                    yield f"data: {json.dumps({'token': f'⚠️ Error: {err}'})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        async def err_stream():
            yield f"data: {json.dumps({'token': f'⚠️ {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(err_stream(), media_type="text/event-stream")
