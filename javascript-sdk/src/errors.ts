/**
 * Ошибка публичного API ShopStream.
 *
 * Бросается, когда HTTP-статус не 2xx.
 */
export class ShopStreamApiError extends Error {
  /** HTTP-статус ответа (0, если запрос не дошёл до сервера). */
  readonly status: number;
  /** Тело ответа-ошибки: `{ error, url, statusCode, statusMessage, message, data? }` (или текст, если не JSON). */
  readonly errors: unknown;
  /** Не используется публичным API v1 (поля `id` в ответах нет); оставлено для совместимости. */
  readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    errors: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ShopStreamApiError';
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
    // Корректный instanceof при компиляции в ES5/CommonJS.
    Object.setPrototypeOf(this, ShopStreamApiError.prototype);
  }
}
