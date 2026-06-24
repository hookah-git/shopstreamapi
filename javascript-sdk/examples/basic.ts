/**
 * Запуск: `npm install && npm run example`
 * (или `bunx tsx examples/basic.ts`).
 *
 * Переменные окружения:
 *   SHOPSTREAM_API_KEY  — ваш ключ
 *   SHOPSTREAM_BASE_URL — базовый URL с префиксом /api
 */
import { ShopStreamApiError, ShopStreamClient } from '../src/index.js';

const apiKey = process.env.SHOPSTREAM_API_KEY ?? 'sk_live_replace_me';
const baseUrl =
  process.env.SHOPSTREAM_BASE_URL ?? 'https://shop-stream.ru/api';

const client = new ShopStreamClient({ apiKey, baseUrl });

async function main() {
  // 1. Каталог услуг.
  const { services } = await client.listServices();
  console.log(`Доступно услуг: ${services.length}`);

  // 2. Баланс.
  const { balance } = await client.getBalance();
  console.log(`Баланс: ${balance}`);

  // 3. Создать заказ «Живой чат».
  const order = await client.createChatOrder({
    platform: 'Twitch',
    channelUrl: 'https://twitch.tv/example',
    startAt: '2026-07-01T18:00:00.000Z',
    durationMinutes: 120,
  });
  console.log(`Создан заказ ${order.id}, статус: ${order.status}`);

  // 4. Получить его обратно.
  const fetched = await client.getOrder(order.id);
  console.log(`Заказ ${fetched.id}: списано ${fetched.amount}`);
}

main().catch((err) => {
  if (err instanceof ShopStreamApiError) {
    console.error(`API error (HTTP ${err.status}):`, err.errors);
  } else {
    console.error(err);
  }
  process.exitCode = 1;
});
