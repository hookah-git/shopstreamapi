<?php

declare(strict_types=1);

namespace ShopStream\Models;

/** Ответ GET /services. */
final class PublicServiceList
{
    /** @param list<PublicService> $services */
    public function __construct(
        public readonly array $services,
    ) {
    }

    /** @param array<string,mixed> $d */
    public static function fromArray(array $d): self
    {
        $services = array_map(
            static fn (array $s): PublicService => PublicService::fromArray($s),
            $d['services'] ?? [],
        );

        return new self($services);
    }
}
