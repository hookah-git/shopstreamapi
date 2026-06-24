<?php

declare(strict_types=1);

namespace ShopStream\Exception;

use RuntimeException;

/**
 * Ошибка публичного API ShopStream.
 *
 * Бросается при HTTP не-2xx или конверте с success: false.
 */
final class ShopStreamApiError extends RuntimeException
{
    /**
     * @param int $status HTTP-статус (0, если запрос не дошёл до сервера).
     * @param mixed $errors Содержимое поля errors из конверта.
     * @param string|null $requestId id запроса из конверта (для трассировки).
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
