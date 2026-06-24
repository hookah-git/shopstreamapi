package shopstream

import "fmt"

// APIError — ошибка публичного API ShopStream.
//
// Возвращается при HTTP не-2xx или конверте с success: false.
type APIError struct {
	// Status — HTTP-статус (0, если запрос не дошёл до сервера).
	Status int
	// Errors — содержимое поля errors из конверта (произвольный JSON).
	Errors interface{}
	// RequestID — id запроса из конверта (для трассировки), если есть.
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
