<?php

declare(strict_types=1);

namespace ShopStream;

use ShopStream\Exception\ShopStreamApiError;
use ShopStream\Models\PublicBalance;
use ShopStream\Models\PublicOrder;
use ShopStream\Models\PublicServiceList;

/**
 * Тонкий клиент публичного API ShopStream (на ext-curl, без внешних зависимостей).
 *
 * Все методы возвращают распакованное поле data из конверта; при success: false
 * или не-2xx статусе бросается {@see ShopStreamApiError}.
 */
final class Client
{
    private readonly string $baseUrl;

    /**
     * @param string $apiKey  Заголовок x-api-key.
     * @param string $baseUrl Базовый URL вместе с префиксом /api.
     * @param int    $timeout Таймаут запроса в секундах.
     */
    public function __construct(
        private readonly string $apiKey,
        string $baseUrl,
        private readonly int $timeout = 30,
    ) {
        if ($apiKey === '') {
            throw new \InvalidArgumentException('apiKey is required');
        }
        if ($baseUrl === '') {
            throw new \InvalidArgumentException('baseUrl is required');
        }
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /** GET /services — каталог доступных услуг с тарификацией. */
    public function listServices(): PublicServiceList
    {
        return PublicServiceList::fromArray($this->request('GET', '/services'));
    }

    /** GET /balance — баланс владельца ключа. */
    public function getBalance(): PublicBalance
    {
        return PublicBalance::fromArray($this->request('GET', '/balance'));
    }

    /**
     * POST /orders — создать заказ «Живой чат».
     * Сумму считает сервер по тарифу; передавать её не нужно.
     *
     * @param CreateChatOrderInput|array<string,mixed> $order
     */
    public function createChatOrder(CreateChatOrderInput|array $order): PublicOrder
    {
        $body = $order instanceof CreateChatOrderInput ? $order->toArray() : $order;

        return PublicOrder::fromArray($this->request('POST', '/orders', $body));
    }

    /** GET /orders/{id} — получить свой заказ по id. */
    public function getOrder(string $id): PublicOrder
    {
        return PublicOrder::fromArray($this->request('GET', '/orders/' . rawurlencode($id)));
    }

    /**
     * @param array<string,mixed>|null $body
     * @return array<string,mixed> Распакованное поле data из конверта.
     */
    private function request(string $method, string $path, ?array $body = null): array
    {
        $ch = curl_init($this->baseUrl . $path);
        if ($ch === false) {
            throw new ShopStreamApiError('curl_init failed', 0);
        }

        $headers = ['x-api-key: ' . $this->apiKey, 'Accept: application/json'];
        $options = [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
        ];
        if ($body !== null) {
            $headers[] = 'Content-Type: application/json';
            $options[CURLOPT_POSTFIELDS] = json_encode($body, JSON_THROW_ON_ERROR);
        }
        $options[CURLOPT_HTTPHEADER] = $headers;
        curl_setopt_array($ch, $options);

        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new ShopStreamApiError("Network error calling {$method} {$path}: {$err}", 0, $err);
        }
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        $payload = null;
        if (is_string($raw) && $raw !== '') {
            try {
                $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw new ShopStreamApiError("Invalid JSON response (status {$status})", $status, $raw);
            }
        }

        $success = is_array($payload) && ($payload['success'] ?? false) === true;
        if ($status < 200 || $status >= 300 || !$success) {
            $errors = is_array($payload) ? ($payload['errors'] ?? null) : $raw;
            $requestId = is_array($payload) ? ($payload['id'] ?? null) : null;
            throw new ShopStreamApiError(
                "Request failed: {$method} {$path} -> HTTP {$status}",
                $status,
                $errors,
                $requestId,
            );
        }

        /** @var array<string,mixed> */
        return $payload['data'] ?? [];
    }
}
