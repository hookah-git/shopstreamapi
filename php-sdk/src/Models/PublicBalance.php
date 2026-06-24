<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Ответ GET /balance. balance — Decimal в виде строки. */
final class PublicBalance
{
    public function __construct(
        public readonly string $balance,
    ) {
    }

    /** @param array<string,mixed> $d */
    public static function fromArray(array $d): self
    {
        return new self(balance: (string) $d['balance']);
    }
}
