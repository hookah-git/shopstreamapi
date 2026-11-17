<?php

declare(strict_types=1);

namespace ShopStream\Exception;

use RuntimeException;

/**
 * Ошибка публичного API ShopStream.
 *
 * Бросается при HTTP не-2xx.
 */
final class ShopStreamApiError extends RuntimeException
{
    /**
     * @param int $status HTTP-статус (0, если запрос не дошёл до сервера).
     * @param mixed $errors Тело ответа-ошибки {error, url, statusCode, statusMessage, message, data?} (или текст).
     * @param string|null $requestId Не используется публичным API v1 (поля id в ответах нет); для совместимости.
     */
    public function __construct(
        string $message,
        public readonly int $status,
        public readonly mixed $errors = null,
        public readonly ?string $requestId = null,
    ) {
        parent::__construct($message, $status);
    }
}
