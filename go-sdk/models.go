package shopstream

// Platform — площадка стрима.
type Platform string

const (
	PlatformTwitch   Platform = "Twitch"
	PlatformKick     Platform = "Kick"
	PlatformYoutube  Platform = "Youtube"
	PlatformWtv      Platform = "Wtv"
	PlatformVkplay   Platform = "Vkplay"
	PlatformTelegram Platform = "Telegram"
)

// ServiceType — тип услуги. В публичном POST /orders доступен только Chat.
type ServiceType string

const (
	ServiceTypeFollow  ServiceType = "Follow"
	ServiceTypeChat    ServiceType = "Chat"
	ServiceTypeViewer  ServiceType = "Viewer"
	ServiceTypeComment ServiceType = "Comment"
)

// OrderStatus — статус заказа.
type OrderStatus string

const (
	OrderStatusSearching  OrderStatus = "Searching"
	OrderStatusAccepted   OrderStatus = "Accepted"
	OrderStatusInProgress OrderStatus = "InProgress"
	OrderStatusPaused     OrderStatus = "Paused"
	OrderStatusCancelled  OrderStatus = "Cancelled"
	OrderStatusCompleted  OrderStatus = "Completed"
)

// ServiceLevel — доплата к итогу заказа за уровень (1, 2, 3); у уровня 1 доплаты нет.
type ServiceLevel struct {
	Level     int     `json:"level"`
	Surcharge float64 `json:"surcharge"`
}

// PublicService — тариф услуги «Живой чат»; cost["price"] — цена часа чата на русском
// со всеми скидками (для другого языка ×2).
type PublicService struct {
	ID       int64                  `json:"id"`
	Platform Platform               `json:"platform"`
	Type     ServiceType            `json:"type"`
	Cost     map[string]interface{} `json:"cost"`
	Levels   []ServiceLevel         `json:"levels"`
}

// PublicServiceList — ответ GET /services.
type PublicServiceList struct {
	Services []PublicService `json:"services"`
}

// PublicBalance — ответ GET /balance. Balance — Decimal в виде строки.
type PublicBalance struct {
	Balance string `json:"balance"`
}

// PublicOrder — заказ. Amount — Decimal в виде строки; даты — ISO 8601 (UTC).
type PublicOrder struct {
	ID        string                 `json:"id"`
	Platform  Platform               `json:"platform"`
	Type      ServiceType            `json:"type"`
	Status    OrderStatus            `json:"status"`
	Params    map[string]interface{} `json:"params"`
	Amount    string                 `json:"amount"`
	CreatedAt string                 `json:"createdAt"`
	UpdatedAt string                 `json:"updatedAt"`
}

// CreateChatOrderInput — тело POST /orders.
//
// Сумма не передаётся — её считает сервер по тарифу услуги. Указатели для
// опциональных полей, чтобы не слать пустые значения (omitempty).
type CreateChatOrderInput struct {
	Platform        Platform `json:"platform"`
	ChannelURL      string   `json:"channelUrl"`      // название канала или ссылка на канал (не на видео/трансляцию)
	StartAt         string   `json:"startAt"`         // ISO 8601 с зоной: Z или смещение (+03:00)
	DurationMinutes int      `json:"durationMinutes"` // 1..1440
	Language        *string  `json:"language,omitempty"`
	Comment         *string  `json:"comment,omitempty"`
	Level           *int     `json:"level,omitempty"` // 1, 2 или 3 (по умолчанию 1)
}
