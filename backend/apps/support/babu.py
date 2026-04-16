import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from django.utils import timezone

from apps.orders.models import Order


ORDER_NO_RE = re.compile(r"\bCS[0-9A-F]{8}\b", re.IGNORECASE)


def _fmt_dt(dt) -> str:
    if not dt:
        return ''
    dt = timezone.localtime(dt)
    return dt.strftime('%d %b %Y, %I:%M %p IST')


def _order_summary(order: Order) -> str:
    last_tracking = order.tracking.order_by('-timestamp').first()
    last_line = ''
    if last_tracking:
        last_line = f"\nLast update: {last_tracking.status} ({_fmt_dt(last_tracking.timestamp)})"

    items_count = order.items.count()
    return (
        f"Order #{order.order_number}\n"
        f"Status: {order.get_status_display()} ({order.status})\n"
        f"Payment: {order.get_payment_status_display()} ({order.payment_status})\n"
        f"Placed on: {_fmt_dt(order.created_at)}\n"
        f"Items: {items_count}\n"
        f"Total: ₹{order.total_amount}"
        f"{last_line}"
    )


def _menu_options(user_orders: int) -> List[Dict[str, Any]]:
    opts: List[Dict[str, Any]] = []
    if user_orders > 0:
        opts.append({'type': 'action', 'label': 'Track my latest order', 'value': 'track_latest'})
        opts.append({'type': 'action', 'label': 'Show my recent orders', 'value': 'list_orders'})
    opts.extend([
        {'type': 'link', 'label': 'My Orders', 'href': '/orders'},
        {'type': 'link', 'label': 'Returns & Refunds', 'href': '/refund'},
        {'type': 'action', 'label': 'Payment issue', 'value': 'payment_help'},
        {'type': 'action', 'label': 'Talk to a human', 'value': 'human_help'},
    ])
    return opts


def _find_order_for_user(user, order_number: Optional[str]) -> Tuple[Optional[Order], Optional[str]]:
    qs = Order.objects.filter(user=user).prefetch_related('tracking', 'items').order_by('-created_at')
    if not qs.exists():
        return None, "I couldn't find any orders for your account yet."
    if order_number:
        order = qs.filter(order_number__iexact=order_number).first()
        if not order:
            return None, f"I couldn't find order #{order_number}. Please double-check the order number."
        return order, None
    return qs.first(), None


def generate_babu_response(*, user, text: str, action: Optional[str] = None) -> Dict[str, Any]:
    """
    Rule-based support assistant that can reference the user's orders.
    Returns a dict: {text: str, options: list[...], meta: {...}}
    """
    raw = (text or '').strip()
    lowered = raw.lower()
    action = (action or '').strip() or None

    user_orders = Order.objects.filter(user=user).count()

    if action == 'menu' or lowered in {'menu', 'help', 'options'} or 'help' in lowered:
        return {
            'text': "Hi, I’m BABU (ClothStore Support). What would you like to do?",
            'options': _menu_options(user_orders),
            'meta': {'kind': 'menu'},
        }

    if action == 'human_help' or 'human' in lowered or 'call' in lowered or 'agent' in lowered:
        return {
            'text': "Sure. You can reach our team:\nCall: 1800-CLOTHSTORE (Mon–Sat 9AM–6PM)\nEmail: support@clothstore.in\n\nIf you share your order number (like CS1A2B3C4D), I can also check the latest status here.",
            'options': [
                {'type': 'link', 'label': 'My Orders', 'href': '/orders'},
                {'type': 'action', 'label': 'Track my latest order', 'value': 'track_latest'} if user_orders > 0 else None,
            ],
            'meta': {'kind': 'human'},
        }

    if action == 'payment_help' or 'payment' in lowered or 'failed' in lowered or 'refund' in lowered:
        return {
            'text': "Payment/Refund help:\n1) If payment failed but money was deducted, it usually auto-reverses in 3–5 business days.\n2) If the order shows 'paid' but you didn't get confirmation, check My Orders.\n3) For refunds after return approval, it can take 5–7 business days.\n\nIf you share your order number, I can check the current payment + order status.",
            'options': [
                {'type': 'link', 'label': 'My Orders', 'href': '/orders'},
                {'type': 'action', 'label': 'Show my recent orders', 'value': 'list_orders'} if user_orders > 0 else None,
            ],
            'meta': {'kind': 'payment'},
        }

    if action in {'track_latest', 'list_orders'} or 'track' in lowered or 'where' in lowered or 'status' in lowered or 'order' in lowered:
        match = ORDER_NO_RE.search(raw)
        order_no = match.group(0).upper() if match else None

        if action == 'list_orders' and user_orders > 0:
            qs = Order.objects.filter(user=user).order_by('-created_at')[:5]
            lines = ["Here are your recent orders:"]
            options: List[Dict[str, Any]] = []
            for o in qs:
                lines.append(f"- {o.order_number} · {o.get_status_display()} · ₹{o.total_amount} · {_fmt_dt(o.created_at)}")
                options.append({'type': 'action', 'label': f"Track {o.order_number}", 'value': f"track:{o.order_number}"})
                options.append({'type': 'link', 'label': f"Open {o.order_number}", 'href': f"/orders/{o.id}"})
            return {'text': "\n".join(lines), 'options': options, 'meta': {'kind': 'orders_list'}}

        if action and action.startswith('track:'):
            order_no = action.split(':', 1)[1].strip().upper()

        order, err = _find_order_for_user(user, order_no)
        if err:
            return {'text': err, 'options': _menu_options(user_orders), 'meta': {'kind': 'order_error'}}
        if not order:
            return {'text': "I couldn't find an order to track.", 'options': _menu_options(user_orders), 'meta': {'kind': 'order_error'}}

        return {
            'text': _order_summary(order),
            'options': [
                {'type': 'link', 'label': 'Open order details', 'href': f"/orders/{order.id}"},
                {'type': 'action', 'label': 'Show my recent orders', 'value': 'list_orders'},
                {'type': 'action', 'label': 'Menu', 'value': 'menu'},
            ],
            'meta': {'kind': 'order_summary', 'order_number': order.order_number, 'order_id': order.id},
        }

    if any(k in lowered for k in ['return', 'replace', 'exchange']):
        return {
            'text': "Returns/Refunds:\nYou can request a return from the Returns & Refunds page. If you tell me your order number, I can also confirm whether it’s eligible (status + dates).",
            'options': [
                {'type': 'link', 'label': 'Go to Returns & Refunds', 'href': '/refund'},
                {'type': 'action', 'label': 'Track my latest order', 'value': 'track_latest'} if user_orders > 0 else None,
                {'type': 'action', 'label': 'Menu', 'value': 'menu'},
            ],
            'meta': {'kind': 'returns'},
        }

    if lowered in {'hi', 'hello', 'hey', 'hii', 'hai'} or lowered.startswith('hi '):
        return {
            'text': "Hi! I’m BABU. I can help you with orders, tracking, returns and payment issues.",
            'options': _menu_options(user_orders),
            'meta': {'kind': 'greeting'},
        }

    return {
        'text': "I can help with:\n- Tracking an order\n- Returns & refunds\n- Payment issues\n\nTell me your order number (example: CS1A2B3C4D) or choose an option.",
        'options': _menu_options(user_orders),
        'meta': {'kind': 'fallback'},
    }

