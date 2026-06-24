# ShopStream PHP SDK

Тонкий клиент публичного API ShopStream на `ext-curl`, без внешних зависимостей.
PHP 8.1+ (используются enum'ы и readonly-свойства).

## Установка

Пакет не публикуется в Packagist. Подключите локально и сгенерируйте автозагрузчик:

```bash
cd php-sdk
composer install   # или: composer dump-autoload
```

PSR-4: namespace `ShopStream\` → каталог `src/`.

## Использование

```php
use ShopStream\Client;
use ShopStream\CreateChatOrderInput;
use ShopStream\Enums\Platform;

$client = new Client(
    'sk_live_...',
    'https://shop-stream.ru/api', // ваш хост + префикс /api
);

$services = $client->listServices();
$balance = $client->getBalance();

$order = $client->createChatOrder(new CreateChatOrderInput(
    platform: Platform::Twitch,
    channelUrl: 'https://twitch.tv/example',
    startAt: '2026-07-01T18:00:00.000Z', // ISO 8601, UTC
    durationMinutes: 120,
));

$fetched = $client->getOrder($order->id);
```

`createChatOrder` принимает как `CreateChatOrderInput`, так и обычный массив
с ключами `platform`, `channelUrl`, `startAt`, `durationMinutes`, ...

## Методы

| Метод | Запрос | Возвращает |
|-------|--------|-----------|
| `listServices()` | `GET /services` | `PublicServiceList` |
| `getBalance()` | `GET /balance` | `PublicBalance` |
| `createChatOrder($order)` | `POST /orders` | `PublicOrder` |
| `getOrder($id)` | `GET /orders/{id}` | `PublicOrder` |

Каждый метод возвращает уже распакованное поле `data` из конверта.

## Ошибки

При HTTP не-2xx или `success: false` бросается `ShopStreamApiError`:

```php
use ShopStream\Exception\ShopStreamApiError;

try {
    $client->getOrder('missing');
} catch (ShopStreamApiError $e) {
    echo $e->status;     // 404
    echo json_encode($e->errors); // тело errors из конверта
    echo $e->requestId;  // id запроса для трассировки
}
```

## Пример

[`examples/basic.php`](./examples/basic.php) — нужны переменные `SHOPSTREAM_API_KEY`,
`SHOPSTREAM_BASE_URL`.

> Примечание: в текущем окружении PHP не установлен, поэтому SDK не запускался
> локально. Для проверки нужны PHP 8.1+ и Composer.
