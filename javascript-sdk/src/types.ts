/** Площадки стрима. */
export type Platform =
  | 'Twitch'
  | 'Kick'
  | 'Youtube'
  | 'Wtv'
  | 'Vkplay'
  | 'Telegram';

/** Типы услуг. `GET /services` и `POST /orders` работают только с `Chat`. */
export type ServiceType = 'Follow' | 'Chat' | 'Viewer' | 'Comment' | 'View';

/** Статусы заказа. */
export type OrderStatus =
  | 'Searching'
  | 'Accepted'
  | 'InProgress'
  | 'Paused'
  | 'Cancelled'
  | 'Completed';

/** Одна услуга из каталога. */
export interface PublicService {
  /** Идентификатор услуги. */
  id: number;
  platform: Platform;
  type: ServiceType;
  /** Тариф: `price` — цена часа чата на русском со всеми скидками пользователя (₽); для другого языка ×2. */
  cost: { price: number };
  /** Доплата к итогу заказа за уровень (1, 2, 3), добавляется после скидок. */
  levels: ServiceLevel[];
}

/** Доплата за уровень заказа чата. */
export interface ServiceLevel {
  level: 1 | 2 | 3;
  /** Доплата, ₽ (у уровня 1 — 0). */
  surcharge: number;
}

/** Ответ `GET /services`. */
export interface PublicServiceList {
  services: PublicService[];
}

/** Ответ `GET /balance`. */
export interface PublicBalance {
  /** Текущий баланс владельца ключа (строка-Decimal). */
  balance: string;
}

/** Заказ. */
export interface PublicOrder {
  id: string;
  platform: Platform;
  type: ServiceType;
  status: OrderStatus;
  /** Для типа `Chat` — {@link ChatOrderParams}, для остальных — как сохранены в заказе. */
  params: ChatOrderParams | Record<string, unknown>;
  /** Списанная сумма (строка-Decimal). */
  amount: string;
  /** ISO 8601, UTC. */
  createdAt: string;
  /** ISO 8601, UTC. */
  updatedAt: string;
}

/** Параметры заказа «Живой чат» в ответе: та же форма, что принимает `POST /orders`. */
export interface ChatOrderParams {
  channelUrl: string;
  /** ISO 8601 (UTC); `null`, если время не удалось восстановить. */
  startAt: string | null;
  durationMinutes: number;
  language: string;
  comment: string;
  level: 1 | 2 | 3;
}

/** Тело `POST /orders`. */
export interface CreateChatOrderInput {
  platform: Platform;
  /** Ссылка на канал/стрим (до 300 символов). */
  channelUrl: string;
  /** Время старта чата, ISO 8601 с зоной: `Z` или смещение (`+03:00`). */
  startAt: string;
  /** Длительность чата в минутах (1..1440). */
  durationMinutes: number;
  /** Язык сообщений (до 50 символов, по умолчанию «Русский»). */
  language?: string;
  /** Произвольный комментарий к заказу (до 500 символов). */
  comment?: string;
  /** Уровень заказа: 1 — чат, 2 — чат + 10 фоллоу-ботов, 3 — + 3 клипа (по умолчанию 1). */
  level?: 1 | 2 | 3;
}

/** Конверт успешного ответа. */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

/** Тело ответа-ошибки (HTTP 4xx/5xx). */
export interface ApiErrorEnvelope {
  error: true;
  url: string;
  statusCode: number;
  /** Причина отказа, например `insufficient balance`. */
  statusMessage: string;
  message: string;
  /** Стабильный код ошибки заказа, если известен. */
  data?: { code?: string };
}
