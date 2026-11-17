<?php

declare(strict_types=1);

namespace ShopStream;

/**
 * Тело POST /orders/comments — заказ «Комментарии» (Telegram).
 *
 * Два вида: пост уже вышел (postUrl) либо запланирован (channelUrl + startAt, минимум за 30 минут
 * до выхода). Сумму считает сервер.
 */
final class CreateCommentOrderInput
{
    public function __construct(
        /** Ссылка на вышедший пост: https://t.me/<канал>/<номер>. */
        public readonly ?string $postUrl = null,
        /** Ссылка на канал, в котором выйдет запланированный пост. */
        public readonly ?string $channelUrl = null,
        /** Когда выйдет пост: ISO 8601 с зоной (Z или смещение +03:00). */
        public readonly ?string $startAt = null,
        /** Произвольный комментарий к заказу (до 1000 символов). */
        public readonly ?string $comment = null,
    ) {
    }

    /** @return array<string,mixed> */
    public function toArray(): array
    {
        $body = [];
        if ($this->postUrl !== null) {
            $body['postUrl'] = $this->postUrl;
        }
        if ($this->channelUrl !== null) {
            $body['channelUrl'] = $this->channelUrl;
        }
        if ($this->startAt !== null) {
            $body['startAt'] = $this->startAt;
        }
        if ($this->comment !== null) {
            $body['comment'] = $this->comment;
        }

        return $body;
    }
}
