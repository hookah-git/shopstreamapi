"""Ошибки публичного API ShopStream."""

from __future__ import annotations

from typing import Any, Optional


class ShopStreamApiError(Exception):
    """Бросается при HTTP не-2xx.

    Атрибуты:
        status: HTTP-статус (0, если запрос не дошёл до сервера).
        errors: тело ответа-ошибки ``{error, url, statusCode, statusMessage, message, data?}``
            (или текст, если ответ не JSON).
        request_id: не используется публичным API v1 (поля ``id`` в ответах нет);
            оставлено для совместимости.
    """

    def __init__(
        self,
        message: str,
        status: int,
        errors: Any = None,
        request_id: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.errors = errors
        self.request_id = request_id
