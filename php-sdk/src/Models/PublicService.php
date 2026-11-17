<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Одна услуга из каталога. */
final class PublicService
{
    /**
     * @param array<string,mixed> $cost Тариф: price — цена часа чата на русском со всеми скидками (₽); для другого языка ×2.
     * @param list<array{level:int,surcharge:int|float}> $levels Доплата к итогу заказа за уровень (1, 2, 3).
     */
    public function __construct(
        public readonly int $id,
        public readonly string $platform,
        public readonly string $type,
        public readonly array $cost,
        public readonly array $levels = [],
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
            levels: $d['levels'] ?? [],
        );
    }
}
