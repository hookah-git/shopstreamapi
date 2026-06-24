// Package shopstream — тонкий клиент публичного API ShopStream.
//
// Все методы возвращают распакованное поле data из конверта ответа; при
// success: false или не-2xx статусе возвращается *APIError.
package shopstream

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Client — клиент публичного API ShopStream.
type Client struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

// Option настраивает Client.
type Option func(*Client)

// WithHTTPClient задаёт свой *http.Client (таймауты, транспорт и т.п.).
func WithHTTPClient(h *http.Client) Option {
	return func(c *Client) { c.httpClient = h }
}

// NewClient создаёт клиент.
//
// baseURL — базовый URL вместе с префиксом /api,
// например "https://shop-stream.ru/api".
func NewClient(apiKey, baseURL string, opts ...Option) (*Client, error) {
	if apiKey == "" {
		return nil, errors.New("shopstream: apiKey is required")
	}
	if baseURL == "" {
		return nil, errors.New("shopstream: baseURL is required")
	}
	c := &Client{
		apiKey:     apiKey,
		baseURL:    strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
	for _, opt := range opts {
		opt(c)
	}
	return c, nil
}

// envelope — общий конверт ответа.
type envelope struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
	Errors  interface{}     `json:"errors"`
	TS      *string         `json:"ts"`
	ID      string          `json:"id"`
}

// ListServices — GET /services.
func (c *Client) ListServices(ctx context.Context) (*PublicServiceList, error) {
	var out PublicServiceList
	if err := c.do(ctx, http.MethodGet, "/services", nil, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// GetBalance — GET /balance.
func (c *Client) GetBalance(ctx context.Context) (*PublicBalance, error) {
	var out PublicBalance
	if err := c.do(ctx, http.MethodGet, "/balance", nil, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// CreateChatOrder — POST /orders. Сумму считает сервер.
func (c *Client) CreateChatOrder(ctx context.Context, in CreateChatOrderInput) (*PublicOrder, error) {
	var out PublicOrder
	if err := c.do(ctx, http.MethodPost, "/orders", in, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// GetOrder — GET /orders/{id}.
func (c *Client) GetOrder(ctx context.Context, id string) (*PublicOrder, error) {
	var out PublicOrder
	path := "/orders/" + url.PathEscape(id)
	if err := c.do(ctx, http.MethodGet, path, nil, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *Client) do(ctx context.Context, method, path string, body, out interface{}) error {
	var reader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("shopstream: marshal request: %w", err)
		}
		reader = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, reader)
	if err != nil {
		return &APIError{Status: 0, Message: err.Error()}
	}
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return &APIError{Status: 0, Errors: err, Message: fmt.Sprintf("network error calling %s %s", method, path)}
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)

	var env envelope
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &env); err != nil {
			return &APIError{Status: resp.StatusCode, Errors: string(raw), Message: "invalid JSON response"}
		}
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 || !env.Success {
		return &APIError{
			Status:    resp.StatusCode,
			Errors:    env.Errors,
			RequestID: env.ID,
			Message:   fmt.Sprintf("request failed: %s %s", method, path),
		}
	}

	if out != nil && len(env.Data) > 0 {
		if err := json.Unmarshal(env.Data, out); err != nil {
			return &APIError{Status: resp.StatusCode, Errors: err, RequestID: env.ID, Message: "cannot decode data payload"}
		}
	}
	return nil
}
