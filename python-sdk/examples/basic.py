"""Пример работы с ShopStream Python SDK.

Запуск:
    pip install -e .
    SHOPSTREAM_API_KEY=sk_live_... SHOPSTREAM_BASE_URL=https://host/api \\
        python examples/basic.py
"""

import os

from shopstream import (
    CreateChatOrderInput,
    Platform,
    ShopStreamApiError,
    ShopStreamClient,
)

api_key = os.environ.get("SHOPSTREAM_API_KEY", "sk_live_replace_me")
base_url = os.environ.get("SHOPSTREAM_BASE_URL", "https://shop-stream.ru/api")

client = ShopStreamClient(api_key=api_key, base_url=base_url)


def main() -> None:
    # 1. Каталог услуг.
    services = client.list_services()
    print(f"Доступно услуг: {len(services.services)}")

    # 2. Баланс.
    balance = client.get_balance()
    print(f"Баланс: {balance.balance}")

    # 3. Создать заказ «Живой чат».
    order = client.create_chat_order(
        CreateChatOrderInput(
            platform=Platform.TWITCH,
            channel_url="https://twitch.tv/example",
            start_at="2026-07-01T18:00:00.000Z",
            duration_minutes=120,
        )
    )
    print(f"Создан заказ {order.id}, статус: {order.status}")

    # 4. Получить его обратно.
    fetched = client.get_order(order.id)
    print(f"Заказ {fetched.id}: списано {fetched.amount}")


if __name__ == "__main__":
    try:
        main()
    except ShopStreamApiError as exc:
        print(f"API error (HTTP {exc.status}): {exc.errors}")
        raise SystemExit(1)
