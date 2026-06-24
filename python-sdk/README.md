# ShopStream Python SDK

Тонкий клиент публичного API ShopStream. Только стандартная библиотека Python —
без внешних зависимостей. Python 3.9+.

## Установка

Пакет не публикуется в PyPI. Установите локально из директории:

```bash
cd python-sdk
pip install -e .
```

## Использование

```python
from shopstream import ShopStreamClient, CreateChatOrderInput, Platform

client = ShopStreamClient(
    api_key="sk_live_...",
    base_url="https://shop-stream.ru/api",  # ваш хост + префикс /api
)

services = client.list_services()
balance = client.get_balance()

order = client.create_chat_order(
    CreateChatOrderInput(
        platform=Platform.TWITCH,
        channel_url="https://twitch.tv/example",
        start_at="2026-07-01T18:00:00.000Z",  # ISO 8601, UTC
        duration_minutes=120,
    )
)

fetched = client.get_order(order.id)
```

`create_chat_order` принимает как `CreateChatOrderInput`, так и обычный `dict`
с ключами `platform`, `channelUrl`, `startAt`, `durationMinutes`, ...

## Методы

| Метод | Запрос | Возвращает |
|-------|--------|-----------|
| `list_services()` | `GET /services` | `PublicServiceList` |
| `get_balance()` | `GET /balance` | `PublicBalance` |
| `create_chat_order(order)` | `POST /orders` | `PublicOrder` |
| `get_order(order_id)` | `GET /orders/{id}` | `PublicOrder` |

Каждый метод возвращает уже распакованное поле `data` из конверта.

## Ошибки

При HTTP не-2xx или `success: false` бросается `ShopStreamApiError`:

```python
from shopstream import ShopStreamApiError

try:
    client.get_order("missing")
except ShopStreamApiError as e:
    print(e.status)      # 404
    print(e.errors)      # тело errors из конверта
    print(e.request_id)  # id запроса для трассировки
```

## Пример

[`examples/basic.py`](./examples/basic.py) — нужны переменные `SHOPSTREAM_API_KEY`,
`SHOPSTREAM_BASE_URL`.
