<?php

declare(strict_types=1);

namespace ShopStream;

/**
 * Тело POST /orders/slay — заказ «Премия SLAY».
 *
 * Выбор номинации, участника и количества голосов. Сумму считает сервер.
 */
final class CreateSlayOrderInput
{
    public function __construct(
        /** Идентификатор номинации из каталога услуг GET /services. */
        public readonly string $nominationId,
        /** Количество голосов. */
        public readonly int $votes,
        /** Участник (если у номинации задан список претендентов). */
        public readonly ?string $contender = null,
        /** Категория (streamers или nominations). Необязательно: если не указано, сервер определит автоматически. */
        public readonly ?string $category = null,
    ) {
    }

    /** @return array<string,mixed> */
    public function toArray(): array
    {
        $body = [
            'nominationId' => $this->nominationId,
            'votes' => $this->votes,
        ];
        if ($this->contender !== null) {
            $body['contender'] = $this->contender;
        }
        if ($this->category !== null) {
            $body['category'] = $this->category;
        }

        return $body;
    }
}
