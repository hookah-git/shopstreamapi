package shopstream

import "fmt"

// APIError — ошибка публичного API ShopStream.
//
// Возвращается при HTTP не-2xx.
type APIError struct {
	// Status — HTTP-статус (0, если запрос не дошёл до сервера).
	Status int
	// Errors — тело ответа-ошибки: { error, url, statusCode, statusMessage, message, data? }
	// (или текст, если ответ не JSON).
	Errors interface{}
	// RequestID — не используется публичным API v1 (поля id в ответах нет); для совместимости.
	RequestID string
	// Message — человекочитаемое описание.
	Message string
}

func (e *APIError) Error() string {
	if e.RequestID != "" {
		return fmt.Sprintf("shopstream: %s (HTTP %d, request %s)", e.Message, e.Status, e.RequestID)
	}
	return fmt.Sprintf("shopstream: %s (HTTP %d)", e.Message, e.Status)
}
