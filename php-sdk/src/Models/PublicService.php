<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Одна услуга из каталога. */
final class PublicService
{
    /**
     * @param array<string,mixed> $cost Тариф: price — цена за час чата со всеми скидками пользователя (₽).
     */
    public function __construct(
        public readonly int $id,
        public readonly string $platform,
        public readonly string $type,
        public readonly array $cost,
    ) {
    }

    /** @param array<string,mixed> $d */
    public static function fromArray(array $d): self
    {
        return new self(
            id: (int) $d['id'],
            platform: (string) $d['platform'],
            type: (string) $d['type'],
            cost: $d['cost'] ?? [],
        );
    }
}
