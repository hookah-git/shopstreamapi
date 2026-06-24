/** Площадки стрима. */
export type Platform =
  | 'Twitch'
  | 'Kick'
  | 'Youtube'
  | 'Wtv'
  | 'Vkplay'
  | 'Telegram';

/** Типы услуг. В публичном POST /orders доступен только `Chat`. */
export type ServiceType = 'Follow' | 'Chat' | 'Viewer' | 'Comment';

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
  /** Параметры тарифа (например, `price`, `quantity`). */
  cost: Record<string, unknown>;
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
  params: Record<string, unknown>;
  /** Списанная сумма (строка-Decimal). */
  amount: string;
  /** ISO 8601, UTC. */
  createdAt: string;
  /** ISO 8601, UTC. */
  updatedAt: string;
}

/** Тело `POST /orders`. */
export interface CreateChatOrderInput {
  platform: Platform;
  /** Ссылка на канал/стрим. */
  channelUrl: string;
  /** Время старта чата, ISO 8601 с `Z` (трактуется как UTC). */
  startAt: string;
  /** Длительность чата в минутах (1..1440). */
  durationMinutes: number;
  /** Язык сообщений (по умолчанию «Русский»). */
  language?: string;
  /** Произвольный комментарий к заказу. */
  comment?: string;
  /** Промокод (опционально). */
  promoCode?: string;
}

/** Конверт успешного ответа. */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  ts: string | null;
  id: string;
}

/** Конверт ответа-ошибки. */
export interface ApiErrorEnvelope {
  success: false;
  errors: unknown;
  ts: string | null;
  id: string;
}
