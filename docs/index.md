---
aside: false
outline: false
pageClass: api-page
---

<script setup>
import { useOpenapi } from 'vitepress-openapi/client'
import spec from './public/openapi.json'

const openapi = useOpenapi()

function responsesOf(operationId) {
  const resolved = openapi?.getOperation?.(operationId)?.responses
  if (resolved) return resolved
  for (const path of Object.values(spec.paths)) {
    for (const op of Object.values(path)) {
      if (op && op.operationId === operationId) return op.responses ?? {}
    }
  }
  return {}
}
</script>

# StreamShop Public API {#top}

Публичный API для внешних клиентов: каталог услуг, баланс и заказы «Живой чат».
Аутентификация по заголовку `x-api-key`, все ответы — в едином конверте
`{ success, data, ts, id }`.

<div class="api-callout">

**Base URL** · <code>https://shop-stream.ru/api</code> — путь эндпоинта добавляется к базе
(итоговый пример: `https://shop-stream.ru/api/services`). Версионирования нет.

</div>

## Аутентификация {#auth}

Каждый запрос должен содержать заголовок:

```http
x-api-key: <ключ>
```

- Ключ привязан к **конкретному пользователю** и даёт доступ ТОЛЬКО к его данным.
- Выпускается **только администратором** (admin/moder). Полный ключ показывается
  **один раз** при выпуске; список своих ключей пользователь видит в `panel/settings`.
- Cookie-сессии публичным API **не принимаются**.

Нет ключа / невалидный ключ → **401**.

## Конверт ответа {#envelope}

Успех:

```json
{ "success": true, "data": { "...": "payload" }, "ts": "42ms", "id": "0f9c1b2e-..." }
```

Ошибка:

```json
{ "success": false, "errors": { "...": "object|array" }, "ts": "42ms", "id": "0f9c1b2e-..." }
```

| Поле | Тип | Описание |
|------|-----|----------|
| `success` | boolean | результат запроса |
| `data` | object | полезная нагрузка (при успехе) |
| `errors` | object \| array | детали ошибки (при `success:false`) |
| `ts` | string \| null | время обработки, напр. `"42ms"` |
| `id` | string (uuid) | идентификатор запроса для трассировки |

> Все [SDK](#sdk) распаковывают конверт автоматически: методы возвращают сразу `data`,
> а при ошибке бросают типизированный `ShopStreamApiError(status, errors, requestId)`.

## Ошибки и лимиты {#errors}

| Код | Когда |
|-----|-------|
| **400** | ошибка валидации тела или недостаточно средств |
| **401** | нет ключа / невалидный ключ |
| **404** | чужой или несуществующий ресурс |
| **422** | бизнес-ограничение (напр. тип услуги вне теста) |
| **429** | превышен лимит запросов |

**Лимиты:** ~60 запросов/мин на ключ + глобальный backstop 120/мин по IP. Превышение → **429**
(рекомендуется экспоненциальный backoff).

## Перечисления {#enums}

- **Platform:** `Twitch` · `Kick` · `Youtube` · `Wtv` · `Vkplay` · `Telegram`
- **ServiceType:** `Follow` · `Chat` · `Viewer` · `Comment` — в `POST /orders` доступен только `Chat`
- **OrderStatus:** `Searching` · `Accepted` · `InProgress` · `Paused` · `Cancelled` · `Completed`

<div class="op-card op-grid">
<div class="op-col">

## Список услуг {#op-listServices}

<OAOperation operationId="listServices" />

</div>
<div class="op-col">
<ClientOnly>
<OAOperationContext operationId="listServices" :openapi="openapi">

<OAResponses operationId="listServices" :responses="responsesOf('listServices')" />

<OACodeSamples operationId="listServices" />

</OAOperationContext>
</ClientOnly>
</div>
</div>

<div class="op-card op-grid">
<div class="op-col">

## Баланс {#op-getBalance}

<OAOperation operationId="getBalance" />

</div>
<div class="op-col">
<ClientOnly>
<OAOperationContext operationId="getBalance" :openapi="openapi">

<OAResponses operationId="getBalance" :responses="responsesOf('getBalance')" />

<OACodeSamples operationId="getBalance" />

</OAOperationContext>
</ClientOnly>
</div>
</div>

<div class="op-card op-grid">
<div class="op-col">

## Создать заказ «Живой чат» {#op-createChatOrder}

<OAOperation operationId="createChatOrder" />

</div>
<div class="op-col">
<ClientOnly>
<OAOperationContext operationId="createChatOrder" :openapi="openapi">

<OAResponses operationId="createChatOrder" :responses="responsesOf('createChatOrder')" />

<OACodeSamples operationId="createChatOrder" />

</OAOperationContext>
</ClientOnly>
</div>
</div>

<div class="op-card op-grid">
<div class="op-col">

## Получить заказ по id {#op-getOrder}

<OAOperation operationId="getOrder" />

</div>
<div class="op-col">
<ClientOnly>
<OAOperationContext operationId="getOrder" :openapi="openapi">

<OAResponses operationId="getOrder" :responses="responsesOf('getOrder')" />

<OACodeSamples operationId="getOrder" />

</OAOperationContext>
</ClientOnly>
</div>
</div>

## SDK {#sdk}

Готовые тонкие клиенты под 4 языка. Одинаковый набор методов, авто-распаковка конверта,
типизированная ошибка `ShopStreamApiError`. Исходники — в директориях `*-sdk/` репозитория.

::: code-group

```ts [JavaScript / TS]
import { ShopStreamClient } from '@shopstream/sdk';

const client = new ShopStreamClient({
  apiKey: process.env.SHOPSTREAM_API_KEY!,
  baseUrl: 'https://shop-stream.ru/api',
});

const { services } = await client.listServices();
const { balance } = await client.getBalance();

const order = await client.createChatOrder({
  platform: 'Twitch',
  channelUrl: 'https://twitch.tv/example',
  startAt: '2026-07-01T18:00:00.000Z',
  durationMinutes: 120,
});

const fetched = await client.getOrder(order.id);
```

```python [Python]
from shopstream import ShopStreamClient, CreateChatOrderInput, Platform

client = ShopStreamClient(
    api_key="sk_live_...",
    base_url="https://shop-stream.ru/api",
)

services = client.list_services()
balance = client.get_balance()

order = client.create_chat_order(
    CreateChatOrderInput(
        platform=Platform.TWITCH,
        channel_url="https://twitch.tv/example",
        start_at="2026-07-01T18:00:00.000Z",
        duration_minutes=120,
    )
)

fetched = client.get_order(order.id)
```

```php [PHP]
use ShopStream\Client;
use ShopStream\CreateChatOrderInput;
use ShopStream\Enums\Platform;

$client = new Client('sk_live_...', 'https://shop-stream.ru/api');

$services = $client->listServices();
$balance = $client->getBalance();

$order = $client->createChatOrder(new CreateChatOrderInput(
    platform: Platform::Twitch,
    channelUrl: 'https://twitch.tv/example',
    startAt: '2026-07-01T18:00:00.000Z',
    durationMinutes: 120,
));

$fetched = $client->getOrder($order->id);
```

```go [Go]
import (
    "context"
    shopstream "github.com/shopstream/go-sdk"
)

client, _ := shopstream.NewClient("sk_live_...", "https://shop-stream.ru/api")
ctx := context.Background()

services, _ := client.ListServices(ctx)
balance, _ := client.GetBalance(ctx)

order, _ := client.CreateChatOrder(ctx, shopstream.CreateChatOrderInput{
    Platform:        shopstream.PlatformTwitch,
    ChannelURL:      "https://twitch.tv/example",
    StartAt:         "2026-07-01T18:00:00.000Z",
    DurationMinutes: 120,
})

fetched, _ := client.GetOrder(ctx, order.ID)
```

:::

| Метод | Запрос |
|-------|--------|
| `listServices()` | `GET /services` |
| `getBalance()` | `GET /balance` |
| `createChatOrder(...)` | `POST /orders` |
| `getOrder(id)` | `GET /orders/{id}` |

Полные README — в `javascript-sdk/`, `python-sdk/`, `php-sdk/`, `go-sdk/`.
