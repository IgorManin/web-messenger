# Web Messenger (Monorepo)

Monorepo на pnpm + Turborepo. Внутри: `apps/frontend`, `apps/backend`, `packages/shared`.

## Репозиторий
- Форкни проект:
  https://github.com/igormanin/web-messenger

- ## Требования
- Node 20 (рекомендуем `nvm use 20`)
- pnpm 10.14.0 (Corepack)
- macOS/Linux/WSL (Windows — через WSL2)

### Быстрый старт окружения
```bash
# версии
nvm use 20
corepack enable
corepack prepare pnpm@10.14.0 --activate
pnpm -v && node -v

# клонирование и установка
git clone https://github.com/your-org/web-messenger.git
cd web-messenger
pnpm install
```
