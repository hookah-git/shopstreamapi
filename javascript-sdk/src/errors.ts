/**
 * Ошибка публичного API ShopStream.
 *
 * Бросается, когда HTTP-статус не 2xx или конверт ответа содержит `success: false`.
 */
export class ShopStreamApiError extends Error {
  /** HTTP-статус ответа (0, если запрос не дошёл до сервера). */
  readonly status: number;
  /** Содержимое поля `errors` из конверта (object | array | строка). */
  readonly errors: unknown;
  /** Идентификатор запроса (`id` из конверта), если есть — для трассировки. */
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
