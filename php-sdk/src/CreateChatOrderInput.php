<?php

declare(strict_types=1);

namespace ShopStream;

use ShopStream\Enums\Platform;

/**
 * Тело POST /orders.
 *
 * Сумма не передаётся — её считает сервер по тарифу услуги.
 */
final class CreateChatOrderInput
{
    public function __construct(
        public readonly Platform|string $platform,
        public readonly string $channelUrl,
        /** ISO 8601 с Z (UTC). */
        public readonly string $startAt,
        /** 1..1440. */
        public readonly int $durationMinutes,
        public readonly ?string $language = null,
        public readonly ?string $comment = null,
        public readonly ?string $promoCode = null,
    ) {
    }

    /** @return array<string,mixed> */
    public function toArray(): array
    {
        $body = [
            'platform' => $this->platform instanceof Platform ? $this->platform->value : $this->platform,
            'channelUrl' => $this->channelUrl,
            'startAt' => $this->startAt,
            'durationMinutes' => $this->durationMinutes,
        ];
        if ($this->language !== null) {
            $body['language'] = $this->language;
        }
        if ($this->comment !== null) {
            $body['comment'] = $this->comment;
        }
        if ($this->promoCode !== null) {
            $body['promoCode'] = $this->promoCode;
        }

        return $body;
    }
}
