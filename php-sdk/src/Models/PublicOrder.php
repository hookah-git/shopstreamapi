<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Заказ. amount — Decimal в виде строки; даты — ISO 8601 (UTC). */
final class PublicOrder
{
    /**
     * @param array<string,mixed> $params Параметры заказа.
     */
    public function __construct(
        public readonly string $id,
        public readonly string $platform,
        public readonly string $type,
        public readonly string $status,
        public readonly array $params,
        public readonly string $amount,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {
    }

    /** @param array<string,mixed> $d */
    public static function fromArray(array $d): self
    {
        return new self(
            id: (string) $d['id'],
            platform: (string) $d['platform'],
            type: (string) $d['type'],
            status: (string) $d['status'],
            params: $d['params'] ?? [],
            amount: (string) $d['amount'],
            createdAt: (string) $d['createdAt'],
            updatedAt: (string) $d['updatedAt'],
        );
    }
}
