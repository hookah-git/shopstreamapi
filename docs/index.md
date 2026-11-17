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

Публичный API для внешних клиентов: каталог услуг, баланс и заказы «Живой чат» и «Живые комментарии» (Telegram).
Аутентификация по заголовку `x-api-key`, успешные ответы — в конверте `{ success, data }`.

<div class="api-callout">

**Base URL** · <code>https://shop-stream.ru/api/v1</code> — путь эндпоинта добавляется к базе
(итоговый пример: `https://shop-stream.ru/api/v1/services`). Версия API — часть пути.

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
{ "success": true, "data": { "...": "payload" } }
```

| Поле | Тип | Описание |
|------|-----|----------|
| `success` | boolean | всегда `true` при успехе |
| `data` | object | полезная нагрузка |

Ошибка (HTTP-статус 4xx/5xx, тело не использует конверт `success`):

```json
{
  "error": true,
  "url": "https://shop-stream.ru/api/v1/orders",
  "statusCode": 409,
  "statusMessage": "insufficient balance",
  "message": "insufficient balance",
  "data": { "code": "free_test_used_chat" }
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `error` | boolean | всегда `true` |
| `url` | string | URL запроса |
| `statusCode` | integer | HTTP-статус |
| `statusMessage` / `message` | string | причина отказа (одинаковы) |
| `data.code` | string? | стабильный код ошибки заказа, если известен (необязательно) |

> Все [SDK](#sdk) распаковывают конверт автоматически: методы возвращают сразу `data`,
> а при ошибке бросают типизированный `ShopStreamApiError(status, errors, requestId)`
> (`errors` — тело ответа-ошибки; `requestId` для публичного API не приходит).

## Ошибки и лимиты {#errors}

| Код | Когда |
|-----|-------|
| **400** | ошибка валидации тела запроса или некорректный id заказа |
| **401** | нет ключа / невалидный или истёкший ключ |
| **403** | пользователь заблокирован |
| **404** | чужой или несуществующий заказ |
| **409** | бизнес-ограничение, например недостаточно средств (`insufficient balance`) или бесплатный тест уже использован |
| **429** | превышен лимит запросов |
| **502** | сервис заказов недоступен или вернул ошибку |

**Лимит:** 60 запросов в минуту на ключ. Превышение → **429** (рекомендуется
экспоненциальный backoff).

## Callback (webhook) {#webhooks}

Пользователь ключа может указать адрес callback в `panel/settings` (адрес только `https`, без
логина/пароля, не `localhost` и не приватные сети). Когда у заказа, **оформленного этим ключом**,
меняется статус, на адрес приходит `POST` с JSON:

```json
{
  "id": "<delivery id>",
  "type": "order.status_changed",
  "createdAt": "2026-07-01T18:00:00.000Z",
  "data": {
    "orderId": "3f1a9c2e-4b7d-4a10-9c1e-2b6f5a8d0e11",
    "status": "InProgress",
    "previousStatus": "Accepted",
    "order": { "...": "тот же объект, что возвращает GET /orders/{id}" }
  }
}
```

Заголовки: `x-streamshop-event`, `x-streamshop-delivery`, `x-streamshop-timestamp`,
`x-streamshop-signature: sha256=<hex>`. Подпись — HMAC-SHA256 от строки `<timestamp>.<тело>`
с секретом вида `whsec_…` (его показывает панель); проверяйте и подпись, и свежесть timestamp.

Ответ получателя с кодом 2xx считается успехом. При ошибке или таймауте (10 с) доставка
повторяется ещё 3 раза: через 5 с, 30 с и 5 минут. Очередь повторов хранится в памяти сервера и
после его перезапуска теряется, поэтому для надёжности периодически сверяйтесь через
`GET /orders/{id}`.

## Перечисления {#enums}

- **Platform:** `Twitch` · `Kick` · `Youtube` · `Wtv` · `Vkplay` · `Telegram` — `Telegram` только у услуги `Comment`
- **ServiceType:** `Follow` · `Chat` · `Viewer` · `Comment` · `View` — в `GET /services` и при создании заказов доступны
  `Chat` (`POST /orders`) и `Comment` (`POST /orders/comments`)
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

## Создать заказ «Живые комментарии» {#op-createCommentOrder}

Заказ комментариев под постом в Telegram. Два вида: **пост уже вышел** (`postUrl`) — работа начинается
сразу; **пост запланирован** (`channelUrl` + `startAt`) — оформлять нужно минимум за 30 минут до выхода.
Цена поста и цены подписок — в `GET /services` (услуга `Telegram` / `Comment`). Оформить подписку через
API нельзя: цены подписок отдаются только для вывода. Бесплатный тест и промокоды недоступны.

<OAOperation operationId="createCommentOrder" />

</div>
<div class="op-col">
<ClientOnly>
<OAOperationContext operationId="createCommentOrder" :openapi="openapi">

<OAResponses operationId="createCommentOrder" :responses="responsesOf('createCommentOrder')" />

<OACodeSamples operationId="createCommentOrder" />

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
  baseUrl: 'https://shop-stream.ru/api/v1',
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

// Живые комментарии (Telegram): пост уже вышел
const commentOrder = await client.createCommentOrder({
  postUrl: 'https://t.me/channel/123',
});
```

```python [Python]
from shopstream import ShopStreamClient, CreateChatOrderInput, CreateCommentOrderInput, Platform

client = ShopStreamClient(
    api_key="sk_live_...",
    base_url="https://shop-stream.ru/api/v1",
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

# Живые комментарии (Telegram): пост уже вышел
comment_order = client.create_comment_order(
    CreateCommentOrderInput(post_url="https://t.me/channel/123")
)
```

```php [PHP]
use ShopStream\Client;
use ShopStream\CreateChatOrderInput;
use ShopStream\CreateCommentOrderInput;
use ShopStream\Enums\Platform;

$client = new Client('sk_live_...', 'https://shop-stream.ru/api/v1');

$services = $client->listServices();
$balance = $client->getBalance();

$order = $client->createChatOrder(new CreateChatOrderInput(
    platform: Platform::Twitch,
    channelUrl: 'https://twitch.tv/example',
    startAt: '2026-07-01T18:00:00.000Z',
    durationMinutes: 120,
));

$fetched = $client->getOrder($order->id);

// Живые комментарии (Telegram): пост уже вышел
$commentOrder = $client->createCommentOrder(new CreateCommentOrderInput(
    postUrl: 'https://t.me/channel/123',
));
```

```go [Go]
import (
    "context"
    shopstream "github.com/shopstream/go-sdk"
)

client, _ := shopstream.NewClient("sk_live_...", "https://shop-stream.ru/api/v1")
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

// Живые комментарии (Telegram): пост уже вышел
postURL := "https://t.me/channel/123"
commentOrder, _ := client.CreateCommentOrder(ctx, shopstream.CreateCommentOrderInput{PostURL: &postURL})
```

:::

| Метод | Запрос |
|-------|--------|
| `listServices()` | `GET /services` |
| `getBalance()` | `GET /balance` |
| `createChatOrder(...)` | `POST /orders` |
| `createCommentOrder(...)` | `POST /orders/comments` |
| `getOrder(id)` | `GET /orders/{id}` |

Полные README — в `javascript-sdk/`, `python-sdk/`, `php-sdk/`, `go-sdk/`.
