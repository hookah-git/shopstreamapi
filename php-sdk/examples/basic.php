<?php

/**
 * Запуск:
 *   cd php-sdk
 *   composer install            # сгенерирует vendor/autoload.php
 *   SHOPSTREAM_API_KEY=sk_live_... SHOPSTREAM_BASE_URL=https://host/api \
 *       php examples/basic.php
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use ShopStream\Client;
use ShopStream\CreateChatOrderInput;
use ShopStream\Enums\Platform;
use ShopStream\Exception\ShopStreamApiError;

$apiKey = getenv('SHOPSTREAM_API_KEY') ?: 'sk_live_replace_me';
$baseUrl = getenv('SHOPSTREAM_BASE_URL') ?: 'https://shop-stream.ru/api';

$client = new Client($apiKey, $baseUrl);

try {
    // 1. Каталог услуг.
    $services = $client->listServices();
    printf("Доступно услуг: %d\n", count($services->services));

    // 2. Баланс.
    $balance = $client->getBalance();
    printf("Баланс: %s\n", $balance->balance);

    // 3. Создать заказ «Живой чат».
    $order = $client->createChatOrder(new CreateChatOrderInput(
        platform: Platform::Twitch,
        channelUrl: 'https://twitch.tv/example',
        startAt: '2026-07-01T18:00:00.000Z',
        durationMinutes: 120,
    ));
    printf("Создан заказ %s, статус: %s\n", $order->id, $order->status);

    // 4. Получить его обратно.
    $fetched = $client->getOrder($order->id);
    printf("Заказ %s: списано %s\n", $fetched->id, $fetched->amount);
} catch (ShopStreamApiError $e) {
    fprintf(STDERR, "API error (HTTP %d): %s\n", $e->status, json_encode($e->errors));
    exit(1);
}
