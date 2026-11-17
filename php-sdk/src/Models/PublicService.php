<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Одна услуга из каталога. */
final class PublicService
{
    /**
     * @param array<string,mixed> $cost Тариф: price — цена со всеми скидками (₽): у Chat цена часа чата на русском (для другого языка ×2), у Comment — цена одного поста.
     * @param list<array{level:int,surcharge:int|float}> $levels Только у Chat: доплата к итогу заказа за уровень (1, 2, 3).
     * @param list<array{id:int,quantity:int,durationHours:int,price:int|float}> $subscriptions Только у Comment: цены подписок (только для вывода).
     */
    public function __construct(
        public readonly int $id,
        public readonly string $platform,
        public readonly string $type,
        public readonly array $cost,
        public readonly array $levels = [],
        public readonly array $subscriptions = [],
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
            subscriptions: $d['subscriptions'] ?? [],
        );
    }
}
