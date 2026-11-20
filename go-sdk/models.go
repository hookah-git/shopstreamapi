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
	PlatformSlay     Platform = "Slay"
)

// ServiceType — тип услуги.
type ServiceType string

const (
	ServiceTypeFollow  ServiceType = "Follow"
	ServiceTypeChat    ServiceType = "Chat"
	ServiceTypeViewer  ServiceType = "Viewer"
	ServiceTypeComment ServiceType = "Comment"
	ServiceTypeSlay    ServiceType = "Slay"
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

// CommentSubscription — цена подписки на комментарии из каталога (только для вывода:
// оформить подписку через API нельзя).
type CommentSubscription struct {
	ID            int     `json:"id"`
	Quantity      int     `json:"quantity"`      // постов в сутки
	DurationHours int     `json:"durationHours"` // срок, часы
	Price         float64 `json:"price"`         // со всеми скидками владельца ключа, ₽
}

// PublicSlayNomination — номинация премии SLAY из каталога.
type PublicSlayNomination struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Category   string   `json:"category"`
	Contenders []string `json:"contenders"`
}

// ServiceLevel — доплата к итогу заказа за уровень (1, 2, 3); у уровня 1 доплаты нет.
type ServiceLevel struct {
	Level     int     `json:"level"`
	Surcharge float64 `json:"surcharge"`
}

// PublicService — услуга каталога. cost["price"] — цена со всеми скидками: у Chat цена часа
// чата на русском (для другого языка ×2), у Comment — цена одного поста.
type PublicService struct {
	ID       int64                  `json:"id"`
	Platform Platform               `json:"platform"`
	Type     ServiceType            `json:"type"`
	Cost     map[string]interface{} `json:"cost"`
	Levels   []ServiceLevel         `json:"levels"` // только у Chat
	// Subscriptions — только у Comment: цены подписок (только для вывода).
	Subscriptions []CommentSubscription `json:"subscriptions"`
	// Только у Slay:
	MinVotes    *int                   `json:"minVotes,omitempty"`
	MaxVotes    *int                   `json:"maxVotes,omitempty"`
	EndsAt      *string                `json:"endsAt,omitempty"`
	Nominations []PublicSlayNomination `json:"nominations,omitempty"`
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

// CreateCommentOrderInput — тело POST /orders/comments (заказ «Комментарии», Telegram).
//
// Два вида: пост уже вышел (PostURL) либо запланирован (ChannelURL + StartAt, минимум за
// 30 минут до выхода). Сумму считает сервер. Указатели — чтобы не слать пустые значения.
type CreateCommentOrderInput struct {
	PostURL    *string `json:"postUrl,omitempty"`    // https://t.me/<канал>/<номер>
	ChannelURL *string `json:"channelUrl,omitempty"` // канал запланированного поста
	StartAt    *string `json:"startAt,omitempty"`    // ISO 8601 с зоной: Z или смещение
	Comment    *string `json:"comment,omitempty"`    // до 1000 символов
}

// CreateSlayOrderInput — тело POST /orders/slay (заказ «Премия SLAY»).
//
// Выбор номинации, участника (если у номинации есть претенденты) и количества голосов.
// Сумму считает сервер.
type CreateSlayOrderInput struct {
	NominationID string  `json:"nominationId"`
	Votes        int     `json:"votes"`
	Contender    *string `json:"contender,omitempty"`
	Category     *string `json:"category,omitempty"` // "streamers" или "nominations"
}

// CreateChatOrderInput — тело POST /orders.
//
// Сумма не передаётся — её считает сервер по тарифу услуги. Указатели для
// опциональных полей, чтобы не слать пустые значения (omitempty).
type CreateChatOrderInput struct {
	Platform        Platform `json:"platform"`
	ChannelURL      string   `json:"channelUrl"`      // название канала или ссылка на канал (у YouTube — любые ссылки, в том числе на видео/трансляцию, сохраняются без изменений)
	StartAt         string   `json:"startAt"`         // ISO 8601 с зоной: Z или смещение (+03:00)
	DurationMinutes int      `json:"durationMinutes"` // 1..1440
	Language        *string  `json:"language,omitempty"`
	Comment         *string  `json:"comment,omitempty"`
	Level           *int     `json:"level,omitempty"` // 1, 2 или 3 (по умолчанию 1)
}
