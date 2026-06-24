<?php

declare(strict_types=1);

namespace ShopStream\Enums;

/** Типы услуг. В публичном POST /orders доступен только Chat. */
enum ServiceType: string
{
    case Follow = 'Follow';
    case Chat = 'Chat';
    case Viewer = 'Viewer';
    case Comment = 'Comment';
}
