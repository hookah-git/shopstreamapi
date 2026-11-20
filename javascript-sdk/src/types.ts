/** Площадки стрима. */
export type Platform =
  | 'Twitch'
  | 'Kick'
  | 'Youtube'
  | 'Wtv'
  | 'Vkplay'
  | 'Telegram'
  | 'Slay';

/** Типы услуг. Заказы через API: `Chat` (`POST /orders`), `Comment` (`POST /orders/comments`) и `Slay` (`POST /orders/slay`). */
export type ServiceType = 'Follow' | 'Chat' | 'Viewer' | 'Comment' | 'View' | 'Slay';

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
  /**
   * Тариф: `price` — цена со всеми скидками пользователя (₽). У `Chat` — цена часа чата на русском
   * (для другого языка ×2), у `Comment` — цена одного поста.
   */
  cost: { price: number };
  /** Только у `Chat`: доплата к итогу заказа за уровень (1, 2, 3), добавляется после скидок. */
  levels?: ServiceLevel[];
  /** Только у `Comment`: цены подписок (только для вывода, оформить подписку через API нельзя). */
  subscriptions?: CommentSubscription[];
  /** Только у `Slay`: минимальное количество голосов. */
  minVotes?: number;
  /** Только у `Slay`: максимальное количество голосов. */
  maxVotes?: number;
  /** Только у `Slay`: дата окончания голосования (ISO 8601). */
  endsAt?: string;
  /** Только у `Slay`: список доступных номинаций. */
  nominations?: PublicSlayNomination[];
}

/** Номинация премии SLAY из каталога. */
export interface PublicSlayNomination {
  id: string;
  title: string;
  category: 'streamers' | 'nominations';
  contenders: string[];
}

/** Подписка на комментарии из каталога. */
export interface CommentSubscription {
  /** Идентификатор тарифа. */
  id: number;
  /** Постов в сутки. */
  quantity: number;
  /** Срок подписки, часы. */
  durationHours: number;
  /** Цена подписки со всеми скидками владельца ключа (₽). */
  price: number;
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
  /** Для `Chat` — {@link ChatOrderParams}, для `Comment` — {@link CommentOrderParams}, для `Slay` — {@link SlayOrderParams}, для остальных — как сохранены в заказе. */
  params: ChatOrderParams | CommentOrderParams | SlayOrderParams | Record<string, unknown>;
  /** Списанная сумма (строка-Decimal). */
  amount: string;
  /** ISO 8601, UTC. */
  createdAt: string;
  /** ISO 8601, UTC. */
  updatedAt: string;
}

/** Параметры заказа «Комментарии» в ответе: та же форма, что принимает `POST /orders/comments`. */
export interface CommentOrderParams {
  alreadyPublished: boolean;
  /** Если пост уже вышел. */
  postUrl?: string;
  /** Если пост запланирован. */
  channelUrl?: string;
  /** ISO 8601 (UTC) для запланированного поста; `null`, если не удалось восстановить. */
  startAt?: string | null;
  comment: string;
}

/** Параметры заказа «Премия SLAY» в ответе: та же форма, что принимает `POST /orders/slay`. */
export interface SlayOrderParams {
  nominationId: string;
  nominationTitle?: string;
  category?: 'streamers' | 'nominations';
  contender?: string;
  votes: number;
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
  /** Название канала или ссылка на канал (у YouTube — любые ссылки, в том числе на видео/трансляцию, сохраняются без изменений), до 300 символов; у остальных площадок сервер приводит к ссылке канала. */
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

/**
 * Тело `POST /orders/comments` — заказ «Комментарии» (Telegram). Два вида: пост уже вышел
 * (`postUrl`) либо запланирован (`channelUrl` + `startAt`, минимум за 30 минут до выхода).
 */
export type CreateCommentOrderInput =
  | {
      /** Ссылка на вышедший пост: `https://t.me/<канал>/<номер>`. */
      postUrl: string;
      /** Произвольный комментарий к заказу (до 1000 символов). */
      comment?: string;
      channelUrl?: never;
      startAt?: never;
    }
  | {
      /** Ссылка на канал, в котором выйдет запланированный пост. */
      channelUrl: string;
      /** Когда выйдет пост, ISO 8601 с зоной: `Z` или смещение (`+03:00`). */
      startAt: string;
      comment?: string;
      postUrl?: never;
    };

/**
 * Тело `POST /orders/slay` — заказ «Премия SLAY».
 * Выбор номинации, участника (если у номинации есть претенденты) и количества голосов.
 */
export interface CreateSlayOrderInput {
  /** Идентификатор номинации из `GET /services`. */
  nominationId: string;
  /** Участник (если у номинации задан непустой список претендентов). */
  contender?: string;
  /** Количество голосов (в пределах `minVotes`..`maxVotes`). */
  votes: number;
  /** Категория (`streamers` или `nominations`). Если не указана, сервер определит автоматически. */
  category?: 'streamers' | 'nominations';
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
