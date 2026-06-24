# ShopStream JavaScript / TypeScript SDK

Тонкий типизированный клиент публичного API ShopStream. Без рантайм-зависимостей —
использует нативный `fetch` (Node.js 18+, Bun, браузер).

## Установка

Пакет не публикуется в npm. Подключите директорию как локальную зависимость или
скопируйте `src/` в проект.

```bash
cd javascript-sdk
npm install      # devDeps: typescript, tsx
npm run build    # сборка в dist/
```

## Использование

```ts
import { ShopStreamClient, ShopStreamApiError } from '@shopstream/sdk';

const client = new ShopStreamClient({
  apiKey: process.env.SHOPSTREAM_API_KEY!,
  baseUrl: 'https://shop-stream.ru/api', // ваш хост + префикс /api
});

const { services } = await client.listServices();
const { balance } = await client.getBalance();

const order = await client.createChatOrder({
  platform: 'Twitch',
  channelUrl: 'https://twitch.tv/example',
  startAt: '2026-07-01T18:00:00.000Z', // ISO 8601, UTC
  durationMinutes: 120,
});

const fetched = await client.getOrder(order.id);
```

## Методы

| Метод | Запрос | Возвращает |
|-------|--------|-----------|
| `listServices()` | `GET /services` | `PublicServiceList` |
| `getBalance()` | `GET /balance` | `PublicBalance` |
| `createChatOrder(input)` | `POST /orders` | `PublicOrder` |
| `getOrder(id)` | `GET /orders/{id}` | `PublicOrder` |

Каждый метод возвращает уже распакованное поле `data` из конверта.

## Ошибки

При HTTP не-2xx или `success: false` бросается `ShopStreamApiError`:

```ts
try {
  await client.getOrder('missing');
} catch (e) {
  if (e instanceof ShopStreamApiError) {
    console.error(e.status);    // 404
    console.error(e.errors);    // тело errors из конверта
    console.error(e.requestId); // id запроса для трассировки
  }
}
```

## Опции конструктора

| Опция | По умолчанию | Описание |
|-------|--------------|----------|
| `apiKey` | — (обяз.) | Заголовок `x-api-key` |
| `baseUrl` | — (обяз.) | Базовый URL + префикс `/api` |
| `timeoutMs` | `30000` | Таймаут запроса |
| `fetch` | `globalThis.fetch` | Своя реализация fetch |

## Пример

[`examples/basic.ts`](./examples/basic.ts) — `npm run example` (нужны переменные
`SHOPSTREAM_API_KEY`, `SHOPSTREAM_BASE_URL`).
