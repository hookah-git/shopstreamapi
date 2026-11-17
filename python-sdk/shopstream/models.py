"""Типы данных публичного API ShopStream."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Union


class Platform(str, Enum):
    """Площадки стрима."""

    TWITCH = "Twitch"
    KICK = "Kick"
    YOUTUBE = "Youtube"
    WTV = "Wtv"
    VKPLAY = "Vkplay"
    TELEGRAM = "Telegram"


class ServiceType(str, Enum):
    """Типы услуг. В публичном POST /orders доступен только ``Chat``."""

    FOLLOW = "Follow"
    CHAT = "Chat"
    VIEWER = "Viewer"
    COMMENT = "Comment"


class OrderStatus(str, Enum):
    """Статусы заказа."""

    SEARCHING = "Searching"
    ACCEPTED = "Accepted"
    IN_PROGRESS = "InProgress"
    PAUSED = "Paused"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"


@dataclass
class CreateChatOrderInput:
    """Тело ``POST /orders``.

    Сумма не передаётся — её считает сервер по тарифу услуги.
    """

    platform: Union[Platform, str]
    channel_url: str
    start_at: str  # ISO 8601 с зоной: ``Z`` или смещение (``+03:00``)
    duration_minutes: int  # 1..1440
    language: Optional[str] = None
    comment: Optional[str] = None
    level: Optional[int] = None  # 1, 2 или 3 (по умолчанию 1)

    def to_dict(self) -> Dict[str, Any]:
        platform = self.platform.value if isinstance(self.platform, Platform) else self.platform
        body: Dict[str, Any] = {
            "platform": platform,
            "channelUrl": self.channel_url,
            "startAt": self.start_at,
            "durationMinutes": self.duration_minutes,
        }
        if self.language is not None:
            body["language"] = self.language
        if self.comment is not None:
            body["comment"] = self.comment
        if self.level is not None:
            body["level"] = self.level
        return body


@dataclass
class CreateCommentOrderInput:
    """Тело ``POST /orders/comments`` — заказ «Живые комментарии» (Telegram).

    Два вида: пост уже вышел (``post_url``) либо запланирован (``channel_url`` +
    ``start_at``, минимум за 30 минут до выхода). Сумму считает сервер.
    """

    post_url: Optional[str] = None  # https://t.me/<канал>/<номер>
    channel_url: Optional[str] = None
    start_at: Optional[str] = None  # ISO 8601 с зоной: ``Z`` или смещение
    comment: Optional[str] = None  # до 1000 символов

    def to_dict(self) -> Dict[str, Any]:
        body: Dict[str, Any] = {}
        if self.post_url is not None:
            body["postUrl"] = self.post_url
        if self.channel_url is not None:
            body["channelUrl"] = self.channel_url
        if self.start_at is not None:
            body["startAt"] = self.start_at
        if self.comment is not None:
            body["comment"] = self.comment
        return body


@dataclass
class PublicService:
    """Одна услуга из каталога."""

    id: int
    platform: str
    type: str
    #: ``{"price": число}`` — цена со всеми скидками (₽): у ``Chat`` цена часа чата на русском
    #: (для другого языка ×2), у ``Comment`` — цена одного поста.
    cost: Dict[str, Any]
    #: Только у ``Chat``: доплаты к итогу заказа за уровни: ``[{"level": 1, "surcharge": 0}, ...]``.
    levels: List[Dict[str, Any]] = field(default_factory=list)
    #: Только у ``Comment``: цены подписок (только для вывода, оформить через API нельзя):
    #: ``[{"id": 1, "quantity": 5, "durationHours": 720, "price": 900}, ...]``.
    subscriptions: List[Dict[str, Any]] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "PublicService":
        return cls(
            id=d["id"],
            platform=d["platform"],
            type=d["type"],
            cost=d.get("cost", {}),
            levels=d.get("levels", []),
            subscriptions=d.get("subscriptions", []),
        )


@dataclass
class PublicServiceList:
    """Ответ ``GET /services``."""

    services: List[PublicService] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "PublicServiceList":
        return cls(services=[PublicService.from_dict(s) for s in d.get("services", [])])


@dataclass
class PublicBalance:
    """Ответ ``GET /balance``. ``balance`` — Decimal в виде строки."""

    balance: str

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "PublicBalance":
        return cls(balance=d["balance"])


@dataclass
class PublicOrder:
    """Заказ. ``amount`` — Decimal в виде строки; даты — ISO 8601 (UTC)."""

    id: str
    platform: str
    type: str
    status: str
    params: Dict[str, Any]
    amount: str
    created_at: str
    updated_at: str

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "PublicOrder":
        return cls(
            id=d["id"],
            platform=d["platform"],
            type=d["type"],
            status=d["status"],
            params=d.get("params", {}),
            amount=d["amount"],
            created_at=d["createdAt"],
            updated_at=d["updatedAt"],
        )
