<?php

declare(strict_types=1);

namespace ShopStream\Enums;

/** Статусы заказа. */
enum OrderStatus: string
{
    case Searching = 'Searching';
    case Accepted = 'Accepted';
    case InProgress = 'InProgress';
    case Paused = 'Paused';
    case Cancelled = 'Cancelled';
    case Completed = 'Completed';
}
