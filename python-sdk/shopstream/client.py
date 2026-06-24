"""Тонкий клиент публичного API ShopStream (только stdlib, без зависимостей)."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Union
from urllib.parse import quote

from .errors import ShopStreamApiError
from .models import (
    CreateChatOrderInput,
    PublicBalance,
    PublicOrder,
    PublicServiceList,
)


class ShopStreamClient:
    """Тонкий клиент публичного API ShopStream.

    Все методы возвращают распакованное поле ``data`` из конверта; при
    ``success: false`` или не-2xx статусе бросается :class:`ShopStreamApiError`.

    Пример::

        client = ShopStreamClient(
            api_key="sk_live_...",
            base_url="https://shop-stream.ru/api",
        )
        services = client.list_services()
    """

    def __init__(
        self,
        api_key: str,
        base_url: str,
        timeout: float = 30.0,
    ) -> None:
        if not api_key:
            raise ValueError("api_key is required")
        if not base_url:
            raise ValueError("base_url is required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def list_services(self) -> PublicServiceList:
        """``GET /services`` — каталог доступных услуг с тарификацией."""
        return PublicServiceList.from_dict(self._request("GET", "/services"))

    def get_balance(self) -> PublicBalance:
        """``GET /balance`` — баланс владельца ключа."""
        return PublicBalance.from_dict(self._request("GET", "/balance"))

    def create_chat_order(
        self,
        order: Union["CreateChatOrderInput", Dict[str, Any]],
    ) -> PublicOrder:
        """``POST /orders`` — создать заказ «Живой чат».

        Сумма считается сервером по тарифу; передавать её не нужно. Принимает
        :class:`CreateChatOrderInput` или обычный ``dict`` с теми же ключами.
        """
        body = order.to_dict() if isinstance(order, CreateChatOrderInput) else dict(order)
        return PublicOrder.from_dict(self._request("POST", "/orders", body))

    def get_order(self, order_id: str) -> PublicOrder:
        """``GET /orders/{id}`` — получить свой заказ по id."""
        path = "/orders/" + quote(order_id, safe="")
        return PublicOrder.from_dict(self._request("GET", path))

    # --- внутреннее ---------------------------------------------------------

    def _request(
        self,
        method: str,
        path: str,
        body: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        url = self.base_url + path
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"x-api-key": self.api_key, "Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status = resp.status
                raw = resp.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            status = exc.code
            raw = exc.read().decode("utf-8") if exc.fp else ""
        except urllib.error.URLError as exc:
            raise ShopStreamApiError(
                f"Network error while calling {method} {path}: {exc.reason}",
                0,
                exc.reason,
            ) from exc

        payload: Optional[Dict[str, Any]] = None
        if raw:
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise ShopStreamApiError(
                    f"Invalid JSON response (status {status})", status, raw
                ) from exc

        if status < 200 or status >= 300 or not payload or payload.get("success") is False:
            errors = payload.get("errors") if payload else raw
            request_id = payload.get("id") if payload else None
            raise ShopStreamApiError(
                f"Request failed: {method} {path} -> HTTP {status}",
                status,
                errors,
                request_id,
            )

        return payload["data"]
