// Запуск:
//
//	cd go-sdk
//	SHOPSTREAM_API_KEY=sk_live_... SHOPSTREAM_BASE_URL=https://host/api \
//	    go run ./example
package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	shopstream "github.com/shopstream/go-sdk"
)

func main() {
	apiKey := envOr("SHOPSTREAM_API_KEY", "sk_live_replace_me")
	baseURL := envOr("SHOPSTREAM_BASE_URL", "https://shop-stream.ru/api")

	client, err := shopstream.NewClient(apiKey, baseURL)
	if err != nil {
		fmt.Println("init:", err)
		os.Exit(1)
	}

	ctx := context.Background()

	if err := run(ctx, client); err != nil {
		var apiErr *shopstream.APIError
		if errors.As(err, &apiErr) {
			fmt.Printf("API error (HTTP %d): %v\n", apiErr.Status, apiErr.Errors)
		} else {
			fmt.Println("error:", err)
		}
		os.Exit(1)
	}
}

func run(ctx context.Context, client *shopstream.Client) error {
	// 1. Каталог услуг.
	services, err := client.ListServices(ctx)
	if err != nil {
		return err
	}
	fmt.Printf("Доступно услуг: %d\n", len(services.Services))

	// 2. Баланс.
	balance, err := client.GetBalance(ctx)
	if err != nil {
		return err
	}
	fmt.Printf("Баланс: %s\n", balance.Balance)

	// 3. Создать заказ «Живой чат».
	order, err := client.CreateChatOrder(ctx, shopstream.CreateChatOrderInput{
		Platform:        shopstream.PlatformTwitch,
		ChannelURL:      "https://twitch.tv/example",
		StartAt:         "2026-07-01T18:00:00.000Z",
		DurationMinutes: 120,
	})
	if err != nil {
		return err
	}
	fmt.Printf("Создан заказ %s, статус: %s\n", order.ID, order.Status)

	// 4. Получить его обратно.
	fetched, err := client.GetOrder(ctx, order.ID)
	if err != nil {
		return err
	}
	fmt.Printf("Заказ %s: списано %s\n", fetched.ID, fetched.Amount)
	return nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
