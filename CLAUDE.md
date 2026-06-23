# CLAUDE.md — Web Messenger

## Обзор проекта

Полноценный кроссплатформенный мессенджер на стадии активной разработки. Цель — продуктовый проект: веб-версия + мобильное приложение на React Native.
Автор развивает его как настоящий продукт, параллельно прокачивая fullstack-навыки.

**Текущий этап:** MVP задеплоен в прод (Fly.io + Vercel). Backend прошёл полный аудит безопасности — все критические и большинство высокоприоритетных пунктов закрыты. Страница профиля реализована (email, аватар, уведомления), добавлен онлайн/оффлайн статус пользователей через Redis. Следующий этап — поле userName, групповые чаты, мобильное приложение.

## Стек

- **Монорепо:** Turborepo 2.0 + pnpm 10.14.0 (workspaces)
- **Backend:** NestJS 11.1.6 (apps/backend)
- **Frontend:** Next.js 15.5.19 + React 18.3.1 + MUI 7.3.8 + Zustand 5.0.11 + TanStack Query 5.90.21 (apps/frontend)
- **Shared:** packages/shared — платформо-независимая логика (типы, контракты API, сервисы)
- **БД:** PostgreSQL (Neon), ORM — Prisma 7.1.0 (адаптер `@prisma/adapter-pg`)
- **Redis:** ioredis — хранение онлайн-статусов пользователей
- **Realtime:** Socket.IO 4.8.x (через `@nestjs/websockets` + `@nestjs/platform-socket.io`)
- **Файлы:** Cloudinary (аватары)
- **Auth:** JWT (access 15min + refresh 7d в httpOnly cookie), Session-таблица с reuse detection
- **Деплой:** Fly.io (backend), Vercel (frontend)

## Структура монорепо

```
web-messenger/
├── apps/
│   ├── backend/          — NestJS API + WebSocket gateway
│   │   ├── src/
│   │   │   ├── auth/     — JWT auth (register, login, refresh, logout), CsrfOriginGuard
│   │   │   ├── session/  — Session repository (rotation, reuse detection)
│   │   │   ├── token/    — TokenService (sign/verify access и refresh)
│   │   │   ├── chat/     — REST API чатов (CRUD, direct chat + first message, repository pattern)
│   │   │   ├── users/    — поиск юзеров, загрузка аватара
│   │   │   ├── ws/       — WebSocket gateway (message:new, typing:update, chat:join, chat:new), DTO-валидация
│   │   │   ├── prisma/   — PrismaService singleton (адаптер pg)
│   │   │   ├── cloudinary/ — загрузка файлов в Cloudinary
│   │   │   ├── common/   — GlobalExceptionFilter
│   │   │   ├── config/   — ConfigModule + Joi-схема валидации env
│   │   │   └── health.*  — healthcheck endpoint (используется Fly.io health-check)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── fly.toml
│   └── frontend/         — Next.js (App Router)
│       ├── middleware.ts  — редирект неавторизованных с /chat на /login
│       └── src/
│           ├── app/
│           │   ├── (public)/[mode]/ — страница логина/регистрации
│           │   ├── (protected)/chat/ — основная страница чата (ChatSidebar + ChatWindow, без пропсов)
│           │   ├── providers.tsx     — QueryClient + WsProvider + useAuthInit
│           │   └── page.tsx          — корневой редирект по наличию refresh cookie
│           ├── features/             — UI-слой (что видит пользователь)
│           │   ├── auth/             — LoginForm, AvatarPicker
│           │   ├── sidebar/          — ChatSidebar, ChatList, SidebarUserProfile, UserSearchList
│           │   └── chat-window/      — ChatWindow, ChatWindowHeader, ChatMessageList, ChatMessageInput
│           ├── modules/              — логика (без UI)
│           │   ├── auth/   — store, api, hooks, actions (refreshToken.action.ts)
│           │   ├── chat/   — store, api, hooks, actions, model
│           │   ├── user/   — store, api, hooks, actions
│           │   ├── ui/     — тема MUI (theme, palette, colors, augmentation)
│           │   └── ws/     — socket.io клиент, хуки, WsProvider
│           └── shared/
│               └── api/apiClient.ts — fetch-обёртка с auto-attach JWT + 401 interceptor
└── packages/
    └── shared/           — кроссплатформенный код, переиспользуется будущим React Native
        └── src/modules/
            ├── chat/     — ChatApi контракт, ChatItem + MessageDto + CreateDirectFirstMessage* типы, loadChats + loadMessages сервисы, lib/errors.ts
            └── user/     — UserApi контракт, CurrentUser + UserSearchResult + UploadAvatarResponse типы, loadMyUser сервис
```

## Схема базы данных (Prisma)

- **User** — id (autoincrement Int), login (unique), passwordHash, avatarUrl?, email? (unique, опционально), notificationsEnabled (Boolean, default true), lastSeen? (DateTime, обновляется при WS disconnect)
- **Session** — id (cuid), userId (FK → User, cascade), tokenHash (unique, SHA-256 хеш refresh-токена), used (Boolean, флаг reuse detection), expiresAt; индекс по userId
- **Chat** — id (cuid), title, type (direct | group), directChatKey? (unique, формат "minId:maxId")
- **ChatParticipant** — связь User ↔ Chat, unique constraint [chatId, userId], индексы по userId и chatId
- **Message** — id (cuid), chatId, authorId, text, clientMessageId? (для идемпотентности), индекс [chatId, createdAt] и [authorId]

Поля `userName` в схеме нет — удалено как мёртвый функционал, будет переосмыслено на этапе профиля.

## Архитектурные решения и паттерны

### Shared-пакет и адаптеры
Проект использует паттерн **контрактов (interfaces)** в `packages/shared`:
- `ChatApi`, `UserApi` — интерфейсы, описывающие API-вызовы
- На фронте создаются **адаптеры** (`webChatApi`, `webUserApi`), которые реализуют эти интерфейсы через `apiClient`
- **Сервисы** в shared (`loadChats`, `loadMessages`, `loadMyUser`) принимают адаптер и выполняют бизнес-логику
- **Actions** на фронте вызывают сервисы из shared и обновляют Zustand-стор
- **Все типы ответов API** живут в shared — для переиспользования на будущем React Native

Это сделано для будущего React Native — там будут свои адаптеры, а сервисы и типы останутся общими.

### Архитектура UI-слоя (фронт)
Разделение на два слоя:
- **`features/`** — UI-компоненты (что видит пользователь). Могут импортировать из `modules/`.
- **`modules/`** — бизнес-логика (store, api, hooks, actions). Не содержат UI.

Каждый крупный UI-блок построен по схеме:
```
features/sidebar/ChatSidebar.tsx  (UI, тупой рендер)
    ↓
modules/chat/hooks/useChatSidebar.ts  (UI-хук)
    ↓
modules/chat/actions/loadChats.action.ts  (Action)
    ↓
packages/shared/.../services/load-chats.ts  (Shared-сервис)
    ↓
modules/chat/api/chat.api-adapter.ts  (Адаптер)
```
- **UI-хуки** — читают стор, вызывают actions, возвращают данные компоненту
- **useUserSearch** — исключение: локальный useState + дебаунс, без стора (ephemeral UI-состояние)
- **Страница чата** — просто рендерит `<ChatSidebar />` и `<ChatWindow />` без пропсов

### ChatWindow — декомпозиция
`ChatWindow` разбит на три компонента в `features/chat-window/`:
- **`ChatWindowHeader`** — аватар, имя собеседника, статус "печатает..." (из `typingByChat` стора)
- **`ChatMessageList`** — лента сообщений со скроллом, группировка по автору, автоскролл вниз, цвета пузырей берутся из `theme.palette.message.mine/other`
- **`ChatMessageInput`** — инпут + кнопка отправки, локальный `text` стейт, `notifyTyping` пропсом
- **`ChatWindow`** — тонкий контейнер: grid `"auto 1fr auto"` + `minHeight: 0` для корректного скролла

### MUI тема — архитектура (macOS Messages стиль)
Тема живёт в `modules/ui/theme/` и состоит из четырёх файлов:
- **`colors.ts`** — все сырые цветовые значения (rgb/rgba строки). Единственный источник цветов. Текущая палитра — тёмная/светлая по образцу macOS Messages: `darkBg`/`darkSurface`, `lightBg`/`lightSurface`, акцент `rgb(0, 122, 255)`, отдельные цвета для пузырей сообщений (`*MessageMine`/`*MessageOther`).
- **`palette.config.ts`** — собирает `darkPalette` и `lightPalette` из `colors`. Содержит кастомные группы: `interactive`, `message`, `avatar`. Оба режима полностью заполнены (ранее `lightPalette` был почти пустым).
- **`theme.augmentation.ts`** — TypeScript module augmentation. Расширяет `Palette` и `PaletteOptions` кастомными полями (`interactive`, `message`, `avatar`).
- **`theme.ts`** — `createAppTheme(mode)`. Собирает тему: palette + shape + component overrides (`MuiCssBaseline`, `MuiPaper`, `MuiOutlinedInput`, `MuiListItemButton`, `MuiAvatar`). Все цвета берутся из `theme.palette.*`, не из `colors` напрямую — прямой импорт `colors` в компонентах не допускается.

Кастомные palette-группы:
```
palette.interactive — selected, hover, focused, border, shadow, shadowFocused
palette.message     — mine, other
palette.avatar      — background, color
```

Глобальные стили (скроллбар, автофилл) живут в `MuiCssBaseline.styleOverrides` в теме — отдельный `globals.css` не используется.

### Auth flow
1. Login/Register → получаем accessToken в body + refreshToken в httpOnly cookie (path: `/`)
2. `useAuthInit` при загрузке приложения вызывает `refreshTokenAction` напрямую через fetch (минуя apiClient)
3. `apiClient` автоматически подставляет Bearer token из Zustand
4. При 401 в `apiClient` — interceptor вызывает `refreshTokenAction`, повторяет оригинальный запрос с новым токеном. Если refresh тоже упал — `clear()` + редирект на `/login`
5. Middleware Next.js проверяет наличие refresh cookie для `/chat/*`
6. Protected layout на клиенте ждёт инициализации auth и редиректит без токена
7. `/auth/refresh` защищён `CsrfOriginGuard` — проверяет заголовок `Origin` запроса против `ALLOWED_ORIGINS`, бросает `ForbiddenException` если origin отсутствует или не разрешён

### Session management (вместо одного refreshTokenHash)
- Таблица `Session`: `tokenHash` (SHA-256 хеш refresh-токена), `used` (флаг), `expiresAt`
- Ротация атомарна — `$transaction`: старая сессия помечается `used: true`, новая создаётся одним вызовом
- **Reuse detection**: повторное использование уже использованного refresh-токена инвалидирует **все** сессии пользователя
- Поддержка нескольких устройств одновременно (несколько активных Session на одного User)
- В refresh-токен добавлен `jti: randomUUID()` — устраняет коллизию `tokenHash` при `register` + `refresh` в одну секунду (совпадающий `iat` раньше давал идентичный JWT и хеш)

### refreshTokenAction
- Живёт в `modules/auth/actions/refreshToken.action.ts`
- Делает fetch напрямую (не через `apiClient`) — чтобы избежать рекурсии в interceptore
- Возвращает `boolean` без побочных эффектов — вызывающий код сам решает что делать при `false`
- Используется в двух местах: `useAuthInit` и `apiClient` interceptor

### State management
- **Zustand** — основной стейт менеджер (auth, chat, user, theme stores)
- **Actions** — standalone async-функции (не хуки), обращаются к стору через `useXxxStore.getState()`
- **TanStack Query** — используется только для auth мутаций (login, register, logout)
- **chat.store** содержит: chats, activeChatId, isChatsLoading, chatsError, messagesByChat, loadedChats, isMessagesLoading, messagesError, draftChat, unreadByChat, typingByChat

### WebSocket архитектура
- Подключение: токен передаётся в `socket.handshake.auth.token`, namespace `/ws`
- CORS для WS-неймспейса берётся из `ALLOWED_ORIGINS` (env), а не хардкодится
- Комнаты: `user:{userId}` (персональная, для chat:new), `chat:{chatId}` (для сообщений и typing)
- Все события (`chat:join`, `message:new`, `typing:update`) валидируются DTO через `class-validator` + глобальный `ValidationPipe` на гейтвее
- `chatId` нормализуется к строке через `@Transform`, `text` ограничен `@MaxLength(4000)`
- `parseUserId` явно проверяет `isNaN` перед использованием — защита от NaN при подделанном payload
- Идемпотентность: `clientMessageId` предотвращает дубли при переподключении
- Автореконнект: reconnection с exponential backoff (300ms → 2000ms)
- `useChatSocket` — подписывается на WS события и пишет напрямую в стор через actions. Вызывается один раз в `WsProvider`
- `handleIncomingMessageAction` — обрабатывает входящее сообщение: `appendMessage` + `incrementUnread` если чат неактивный и сообщение чужое
- `GlobalExceptionFilter` обрабатывает и WS-исключения — клиенту приходит `{ statusCode, message }` через `client.emit('error')`, без утечки стека

### Онлайн-статус
- **Redis** — ключ `online:{userId}` (TTL 24ч как страховка от не убранного ключа при крэше процесса; реального "источника правды" по живости соединения он не заменяет — это in-memory `Map<userId, Set<socketId>>` в `WsGateway`)
- **Подключение** — на первом сокете юзера (если ни одного активного соединения не было) пишем ключ в Redis и рассылаем `user:online` всем co-участникам его чатов (через `chatRepository.getCoParticipantUserIds`, broadcast в комнаты `user:{participantId}`)
- **Отключение** — `grace period` 10 секунд (`setTimeout`) перед тем как считать юзера оффлайн — спасает от ложных оффлайнов при коротком переподключении (reload страницы, временный обрыв сети). Если в течение grace period юзер переподключился — таймер отменяется, `user:offline` не рассылается
- По истечении grace period без реконнекта: ключ удаляется из Redis, `lastSeen` пишется в БД (`usersRepository.updateLastSeen`), всем co-участникам рассылается `user:offline` с `{ userId, lastSeen }`
- **Начальное состояние при коннекте** — сразу после подключения сервер дополнительно проверяет через Redis `MGET`, кто из co-участников уже онлайн, и шлёт `user:online` точечно подключившемуся клиенту (не broadcast) — иначе фронт узнавал бы о уже-онлайн контактах только при их следующем переподключении
- **WS-события**: `user:online` → `{ userId }`, `user:offline` → `{ userId, lastSeen? }`
- **Фронт** — `useChatSocket` слушает оба события, пишет в `user.store` (`onlineUserIds: Set<number>`, `lastSeenByUser: Record<number, string>`)
- **MUI тема** — `palette.status.online` (зелёный, `rgb(52, 199, 89)`), добавлен в `colors.ts`/`palette.config.ts`/`theme.augmentation.ts` по тому же паттерну, что `interactive`/`message`/`avatar`. Отдельного цвета для оффлайн-состояния нет — используется обычный `theme.palette.text.secondary`
- **`ChatWindowHeader`** — субтайтл с приоритетом: "печатает..." → "в сети" → "был(а) в сети {время}" (если есть `lastSeen`) → пусто
- **Сайдбар (`ChatList`)** — зелёная точка (8px, `borderRadius: "50%"`) справа от имени собеседника, если он онлайн; без пульсации/анимации

### Draft-чаты
- `selectUserAction` — клик на найденного пользователя: если чат есть → открываем, если нет → создаём `DraftDirectChat` в сторе
- `sendFirstMessageAction` — отправка первого сообщения: создаёт реальный чат на бэке (в транзакции), убирает draft, добавляет чат и сообщение в стор
- `DraftDirectChat` живёт только на фронте в `modules/chat/model/types.ts`, в shared не нужен

## Безопасность backend

Полный аудит проведён и закрыт по всем критическим и большинству высокоприоритетных пунктов:

- **JWT-секреты** — `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` обязательны через Joi (`config/validation.ts`), приложение не стартует без них. Дефолтного секрета `"dev"` нет
- **CORS** — конкретный список origin из `ALLOWED_ORIGINS` (и для HTTP в `main.ts`, и для WS-неймспейса в `ws.gateway.ts`), не `origin: true`
- **CSRF** — `CsrfOriginGuard` на `/auth/refresh`, сверяет `Origin` с `ALLOWED_ORIGINS`
- **Session reuse detection** — см. раздел Session management выше
- **Rate limiting** — глобальный `ThrottlerGuard` (100/мин) + точечные `@Throttle` на `/auth/register` и `/auth/login` (5/мин), `/users/search` (30/мин), `/users/avatar` (10/мин)
- **Helmet** — подключён в `main.ts`
- **Global exception filter** — `common/filters/global-exception.filter.ts`: Prisma-ошибки (P2002 → 409, P2025 → 404, остальное → generic 500) и любые необработанные исключения не отдают стек клиенту; работает и для HTTP, и для WS
- **Cookie** — `httpOnly`, `secure` в проде, `sameSite: "lax"` всегда (и в проде, и в dev — после перехода на Vercel rewrite запросы стали same-origin, `"none"` больше не нужен), `path: "/"`, `maxAge: 7d`; `clearCookie` при logout использует тот же набор опций — рассинхрона path быть не может
- **Пароль** — `@MinLength(4)` на регистрации (todo-комментарий про более низкий лимит убран)
- **case-insensitive login** — `findByLogin` использует `mode: 'insensitive'`
- **WS-валидация** — DTO на все три события, `chatId` нормализован, `text` ограничен, `Number(user.id)` защищён от NaN
- **Транзакция** — `createDirectFirstMessage` оборачивает создание чата + сообщения в `$transaction`
- **Мёртвый код** — старый in-memory `messages.*` модуль удалён, не подключён в `app.module.ts`

Известный риск, требующий внимания: порядок инициализации `dotenv.config()` в `main.ts` — должен выполняться раньше любых импортов модулей приложения (сейчас гарантировано через размещение `dotenv.config()` в самом начале файла, до `import { AppModule }`, что критично под CommonJS — `require()` не хоистится как ESM-импорты).

## Текущее состояние

### Что работает
- Регистрация и логин с JWT (access + refresh), Session-таблица с ротацией и reuse detection
- CSRF-защита `/auth/refresh` через проверку Origin
- Rate limiting на auth, поиск пользователей, загрузку аватара
- Глобальный exception filter (HTTP + WS), без утечки деталей ошибок
- Helmet, строгий CORS по списку origin
- Загрузка аватара через Cloudinary
- Поиск пользователей в сайдбаре (с дебаунсом)
- Список чатов в сайдбаре с аватарами/инициалами и профилем юзера сверху
- Переключение между чатами
- Загрузка и отображение сообщений
- Отправка сообщений через WebSocket с DTO-валидацией
- Draft-чаты — открытие диалога с новым пользователем до первого сообщения
- Создание direct-чата при отправке первого сообщения (атомарно, в транзакции)
- Realtime: новые сообщения приходят через WebSocket в стор
- Realtime: `lastMessage` и сортировка чатов обновляются при новом сообщении
- Unread badges в сайдбаре (сбрасываются при открытии чата)
- Typing indicator в `ChatWindowHeader` ("печатает...")
- MUI тема в стиле macOS Messages — централизованная система цветов через palette + module augmentation, отдельные палитры для message-пузырей
- Кастомный скроллбар через `MuiCssBaseline`
- Онлайн/оффлайн статус пользователей — Redis + grace period 10с на disconnect, `user:online`/`user:offline` события, зелёная точка в сайдбаре, субтайтл "в сети"/"был(а) в сети" в `ChatWindowHeader`
- Деплой: backend на Fly.io (`messenger-api.fly.dev`), frontend на Vercel (`messenger-web-prod.vercel.app`)

### Что не реализовано (следующий этап)
- **Кнопка отправки** — не дизейблится во время отправки. Нужен `isSending` стейт в `useChatWindow`
- **Поле `userName`** — уникальный никнейм с @ префиксом, был удалён как мёртвый код, нужно спроектировать заново (страница профиля уже есть, но без него)

### Что не реализовано (MVP)
- Редактирование сообщений
- Статус доставки сообщений
- Групповые чаты
- Пагинация сообщений (`getMessagesByChat` отдаёт всю историю)

## Мобильное приложение (React Native)

Мобильная версия не начата, но архитектура изначально проектировалась с учётом будущего переноса.

### Что уже готово к переиспользованию
- **`packages/shared`** — полностью платформо-независим: контракты (`ChatApi`, `UserApi`), сервисы (`loadChats`, `loadMessages`, `loadMyUser`), все DTO-типы (`ChatItem`, `MessageDto`, `CurrentUser`, `UserSearchResult`, `CreateDirectFirstMessage*`). Никаких React-хуков, browser API или Next.js — переносится в RN без изменений
- **Бизнес-логика сервисов** (`load-chats.ts`, `load-messages.ts`, `load-me.ts`) — принимает адаптер как параметр, не завязана на конкретную реализацию HTTP-клиента
- **Контракт-ориентированная архитектура** — паттерн адаптеров (`webChatApi`/`webUserApi` на фронте) проверен в проде, легко зеркалится в `mobileChatApi`/`mobileUserApi`
- **Типы WS-событий и формат сообщений** — совпадают между HTTP DTO и WS payload, можно использовать тот же `MessageDto` на RN-клиенте

### Что нужно сделать
- **Expo setup** — инициализация RN-проекта (Expo + TypeScript), добавление в `pnpm-workspace.yaml` как новый workspace (`apps/mobile`)
- **Мобильные адаптеры** — `mobileChatApi`, `mobileUserApi`, реализующие те же контракты что и web-адаптеры, но через `fetch`/`axios` с токеном из `expo-secure-store` вместо Zustand+localStorage
- **Auth на мобильном** — refresh-токен в httpOnly cookie не работает в RN так же как в браузере; нужно либо передавать refresh-токен в теле ответа и хранить в `expo-secure-store`, либо настроить cookie-jar (`@react-native-cookies/cookies`)
- **WebSocket-клиент** — `socket.io-client` совместим с RN, но нужен отдельный `useChatSocket` хук без зависимости от DOM/браузерных API
- **UI-слой** — полностью с нуля: React Native компоненты (`features/` на RN), своя навигация (`react-navigation` или `expo-router`), своя тема (MUI не работает в RN — потребуется аналог на `react-native-paper` или кастомные компоненты)
- **Push-уведомления** — не покрыто текущей архитектурой backend, понадобится отдельный модуль (Expo Push Notifications + хранение device token)

## Деплой

### Backend — Fly.io
- **URL:** `messenger-api.fly.dev`
- **Конфиг:** `apps/backend/fly.toml` — app `messenger-api`, Dockerfile-билд, internal port 3001, health-check на `GET /health` (grace 5s, interval 10s, timeout 2s), `auto_stop_machines`/`auto_start_machines` включены, `min_machines_running = 0`
- **Деплой запускается из корня монорепо**, не из `apps/backend/`:
  ```bash
  fly deploy --config apps/backend/fly.toml
  ```
  Dockerfile ожидает build-контекст корня монорепо (копирует `pnpm-workspace.yaml`, `packages/shared` и т.д.) — запуск из `apps/backend/` сломает сборку, так как нужные файлы окажутся вне контекста.
- **Dockerfile:** многостадийная сборка (`deps` → `build` → `runner`); `prisma generate` выполняется в стадии `deps` (после `pnpm install`, до копирования остального кода) — сгенерированный клиент живёт в pnpm virtual store (`node_modules/.pnpm/@prisma+client@.../node_modules/.prisma/client`) и копируется в `runner` вместе с целым `node_modules`, явный copy конкретного `.prisma`-пути не используется (путь нестабилен из-за хеша в pnpm store)
- **Env переменные (обязательны для старта, валидируются Joi):**
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `DATABASE_URL` (Neon Postgres)
  - `REDIS_URL` — хранение онлайн-статусов; в Joi-схеме technically optional с дефолтом `redis://localhost:6379` для удобства локального dev, но в проде должен указывать на реальный Redis-инстанс, иначе онлайн-статусы не будут работать между перезапусками процесса
  - `ALLOWED_ORIGINS` (должен включать домен Vercel-фронта)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Опциональные env:** `PORT` (default 3001), `NODE_ENV`, `JWT_ACCESS_EXPIRES_IN` (default 15m), `JWT_REFRESH_EXPIRES_IN` (default 7d), `COOKIE_DOMAIN`
- В этой монорепе `apps/backend/package.json` — `"type": "commonjs"`, `tsconfig.json` — `module: CommonJS`, `moduleResolution: Node`, `esModuleInterop: true` (важно для корректной интеропа default-импортов `joi`/`cookie-parser`/`pg`)

### Frontend — Vercel
- **URL:** `messenger-web-prod.vercel.app`
- **`apps/frontend/vercel.json`** — содержит rewrite:
  ```json
  { "rewrites": [{ "source": "/api/:path*", "destination": "https://messenger-api.fly.dev/:path*" }] }
  ```
  Фронт ходит на бэк через `/api/*` — с точки зрения браузера это same-origin запрос к `messenger-web-prod.vercel.app`, Vercel проксирует его на Fly.io на своей стороне. Это решает проблему с cookie на десктопе и в PWA (раньше прямой кросс-доменный запрос на `fly.dev` требовал `sameSite: "none"` и cookie не всегда долетала).
  Важно: rewrites из `vercel.json` работают **только** на платформе Vercel (или через `vercel dev`) — обычный `next dev`/`next start` их не применяет; в `next.config.mjs` дублирующего `async rewrites()` нет.
- **Env переменные:**
  - `NEXT_PUBLIC_API_URL` — `/api` (относительный путь через Vercel rewrite proxy, не прямой URL на `fly.dev`)
  - `NEXT_PUBLIC_WS_URL` — WebSocket-адрес backend напрямую (`/ws` namespace), rewrite на WS не распространяется, остаётся прямым кросс-доменным подключением на `fly.dev`
- **PWA:** базовая поддержка добавлена — `manifest.json`, иконки (192/512), service worker через `@ducanh2912/next-pwa` (отключён в dev, генерируется только при `next build`). Cookie с refresh-токеном работает корректно и на десктопном вебе, и в PWA — благодаря Vercel rewrite proxy выше (same-origin запросы вместо кросс-доменных).

### CI
- `.github/workflows/ci.yml` — Node 20, pnpm 10.14.0; на push в `main`/`develop`/`feature/*`/`chore/*` и PR в `main`/`develop` гоняет `lint`, `typecheck`, `build` через Turborepo

## Конвенции кода

### Backend (NestJS)
- Модульная структура: каждый домен (auth, session, token, chat, users, ws) — отдельный NestJS module
- Repository pattern с DI-токенами (`CHAT_REPOSITORY`, `MESSAGE_REPOSITORY`, `SESSION_REPOSITORY`, `AUTH_REPOSITORY`) — сервисы зависят от интерфейсов, не от Prisma напрямую
- DTO валидируются через `class-validator` + `ValidationPipe(whitelist, transform)` — и на HTTP, и на WS
- Guards: `JwtAccessGuard`, `JwtRefreshGuard` (Passport strategies), `CsrfOriginGuard` (кастомный, проверка Origin)
- Декоратор `@CurrentUser()` для извлечения пользователя из JWT
- Ошибки: стандартные NestJS exceptions, перехватываются `GlobalExceptionFilter`

### Frontend (Next.js)
- App Router с route groups: `(public)` для auth-страниц, `(protected)` для чата
- **`features/`** — UI-компоненты, организованы по фиче (sidebar, chat-window, auth)
- **`modules/`** — бизнес-логика, организована по домену (chat, user, auth, ws, ui)
- Stores: Zustand с разделением state и actions типов
- API: `apiClient` — единая fetch-обёртка; доменные API-файлы возвращают типизированные вызовы
- UI: Material UI (MUI), все цвета только через `theme.palette.*`
- "use client" на всех интерактивных компонентах

### Общие
- TypeScript strict mode
- ESLint 9 (flat config) + Prettier (конфиг в корне)
- Git flow: `main` → `develop` → feature branches (`feat/*`, `feature/*`, `chore/*`)
- Пакетный менеджер: pnpm 10.14.0

## Важные замечания для работы с кодом

1. **НЕ модифицируй `packages/shared` без понимания** — этот пакет должен оставаться платформо-независимым (никаких React-хуков, browser API, Next.js)
2. **Все типы ответов API живут в shared** — для переиспользования на React Native
3. **`appendMessage` в сторе** — защищён от дублей, обновляет `lastMessage` и сортирует чаты
4. **`loadMessagesAction`** кэширует через `loadedChats: Set<string>` в сторе — флаг проставляется только после успешной загрузки с бэка. WS-сообщения через `appendMessage` кэш не трогают
5. **`ChatItem` в shared** содержит `companion: UserSearchResult | null` и `type: ChatType`
6. **`DraftDirectChat`** — фронтовый тип, живёт в `modules/chat/model/types.ts`, в shared не нужен
7. **`useChatSocket`** вызывается в `WsProvider` — один раз на всё приложение
8. **Env переменные:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` (фронт); `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `CLOUDINARY_*` (бэк, обязательны через Joi)
9. **Бэкенд слушает на порту 3001** по умолчанию
10. **Автор учится**, поэтому предпочитает объяснения и обсуждение архитектуры, а не готовый код без контекста
11. **Тема MUI** — все цвета только через `theme.palette.*`. Прямой импорт из `colors.ts` в компонентах не допускается — только через палитру
12. **`refreshTokenAction`** делает fetch напрямую, минуя `apiClient` — это намеренно, чтобы избежать рекурсии в interceptore. Не переписывать через `authApi.refresh()`
13. **`dotenv.config()` в `main.ts` должен быть первой исполняемой строкой**, до любых импортов модулей приложения — под CommonJS `require()` не хоистится, порядок важен для корректной инициализации `ALLOWED_ORIGINS` и других env в декораторах вроде `@WebSocketGateway()`
14. **Generated Prisma client** в этой pnpm-монорепе физически лежит в `node_modules/.pnpm/@prisma+client@.../node_modules/.prisma/client` — копировать в Docker нужно весь `node_modules`, а не точечный путь `node_modules/.prisma` (его не существует на верхнем уровне)
