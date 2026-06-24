# ShopStream Go SDK

Тонкий клиент публичного API ShopStream на стандартной библиотеке (`net/http`),
без внешних зависимостей. Go 1.21+.

## Установка

Пакет не публикуется. Локально путь модуля — `github.com/shopstream/go-sdk`
(плейсхолдер; замените на свой при вендоринге).

```bash
cd go-sdk
go build ./...
```

## Использование

```go
import (
    "context"
    shopstream "github.com/shopstream/go-sdk"
)

client, err := shopstream.NewClient(
    "sk_live_...",
    "https://shop-stream.ru/api", // ваш хост + префикс /api
)
if err != nil { /* ... */ }

ctx := context.Background()

services, err := client.ListServices(ctx)
balance, err := client.GetBalance(ctx)

order, err := client.CreateChatOrder(ctx, shopstream.CreateChatOrderInput{
    Platform:        shopstream.PlatformTwitch,
    ChannelURL:      "https://twitch.tv/example",
    StartAt:         "2026-07-01T18:00:00.000Z", // ISO 8601, UTC
    DurationMinutes: 120,
})

fetched, err := client.GetOrder(ctx, order.ID)
```

## Методы

| Метод | Запрос | Возвращает |
|-------|--------|-----------|
| `ListServices(ctx)` | `GET /services` | `*PublicServiceList` |
| `GetBalance(ctx)` | `GET /balance` | `*PublicBalance` |
| `CreateChatOrder(ctx, in)` | `POST /orders` | `*PublicOrder` |
| `GetOrder(ctx, id)` | `GET /orders/{id}` | `*PublicOrder` |

Каждый метод возвращает уже распакованное поле `data` из конверта.

## Ошибки

При HTTP не-2xx или `success: false` возвращается `*APIError`:

```go
_, err := client.GetOrder(ctx, "missing")
var apiErr *shopstream.APIError
if errors.As(err, &apiErr) {
    fmt.Println(apiErr.Status)    // 404
    fmt.Println(apiErr.Errors)    // тело errors из конверта
    fmt.Println(apiErr.RequestID) // id запроса для трассировки
}
```

## Настройка

`NewClient` принимает `Option`-функции, напр. `WithHTTPClient(&http.Client{...})`
для своих таймаутов/транспорта.

## Пример

[`example/main.go`](./example/main.go) — `go run ./example` (нужны переменные
`SHOPSTREAM_API_KEY`, `SHOPSTREAM_BASE_URL`).
