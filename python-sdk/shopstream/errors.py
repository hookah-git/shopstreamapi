"""Ошибки публичного API ShopStream."""

from __future__ import annotations

from typing import Any, Optional


class ShopStreamApiError(Exception):
    """Бросается при HTTP не-2xx или конверте с ``success: false``.

    Атрибуты:
        status: HTTP-статус (0, если запрос не дошёл до сервера).
        errors: содержимое поля ``errors`` из конверта.
        request_id: ``id`` запроса из конверта (для трассировки), если есть.
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
