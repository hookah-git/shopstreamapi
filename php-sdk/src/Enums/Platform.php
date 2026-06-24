<?php

declare(strict_types=1);

namespace ShopStream\Enums;

/** Площадки стрима. */
enum Platform: string
{
    case Twitch = 'Twitch';
    case Kick = 'Kick';
    case Youtube = 'Youtube';
    case Wtv = 'Wtv';
    case Vkplay = 'Vkplay';
    case Telegram = 'Telegram';
}
