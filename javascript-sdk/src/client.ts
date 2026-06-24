import { ShopStreamApiError } from './errors.js';
import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  CreateChatOrderInput,
  PublicBalance,
  PublicOrder,
  PublicServiceList,
} from './types.js';

export interface ShopStreamOptions {
  /** API-ключ (заголовок `x-api-key`). Выпускается администратором. */
  apiKey: string;
  /**
   * Базовый URL вместе с префиксом `/api`.
   * Пример: `https://shop-stream.ru/api`.
   */
  baseUrl: string;
  /** Таймаут запроса в миллисекундах (по умолчанию 30000). */
  timeoutMs?: number;
  /** Своя реализация fetch (для тестов / нестандартного рантайма). */
  fetch?: typeof fetch;
}

/**
 * Тонкий клиент публичного API ShopStream.
 *
 * Все методы возвращают распакованное поле `data` из конверта; при `success: false`
 * или не-2xx статусе бросается {@link ShopStreamApiError}.
 *
 * @example
 * ```ts
 * const client = new ShopStreamClient({
 *   apiKey: 'sk_live_...',
 *   baseUrl: 'https://shop-stream.ru/api',
 * });
 * const { services } = await client.listServices();
 * ```
 */
export class ShopStreamClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ShopStreamOptions) {
    if (!options.apiKey) throw new Error('ShopStreamClient: apiKey is required');
    if (!options.baseUrl) throw new Error('ShopStreamClient: baseUrl is required');
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 30_000;
    const f = options.fetch ?? globalThis.fetch;
    if (!f) {
      throw new Error(
        'ShopStreamClient: global fetch is not available; pass options.fetch',
      );
    }
    this.fetchImpl = f;
  }

  /** `GET /services` — каталог доступных услуг с тарификацией. */
  listServices(): Promise<PublicServiceList> {
    return this.request<PublicServiceList>('GET', '/services');
  }

  /** `GET /balance` — баланс владельца ключа. */
  getBalance(): Promise<PublicBalance> {
    return this.request<PublicBalance>('GET', '/balance');
  }

  /**
   * `POST /orders` — создать заказ «Живой чат».
   * Сумма считается сервером по тарифу; передавать её не нужно.
   */
  createChatOrder(input: CreateChatOrderInput): Promise<PublicOrder> {
    return this.request<PublicOrder>('POST', '/orders', input);
  }

  /** `GET /orders/{id}` — получить свой заказ по id. */
  getOrder(id: string): Promise<PublicOrder> {
    return this.request<PublicOrder>(
      'GET',
      `/orders/${encodeURIComponent(id)}`,
    );
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'x-api-key': this.apiKey,
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err) {
      throw new ShopStreamApiError(
        `Network error while calling ${method} ${path}: ${(err as Error).message}`,
        0,
        err,
      );
    } finally {
      clearTimeout(timer);
    }

    let payload: ApiEnvelope<T> | ApiErrorEnvelope | undefined;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new ShopStreamApiError(
          `Invalid JSON response (status ${response.status})`,
          response.status,
          text,
        );
      }
    }

    if (!response.ok || !payload || payload.success === false) {
      const errors = payload && 'errors' in payload ? payload.errors : payload;
      throw new ShopStreamApiError(
        `Request failed: ${method} ${path} → HTTP ${response.status}`,
        response.status,
        errors,
        payload?.id,
      );
    }

    return payload.data;
  }
}
