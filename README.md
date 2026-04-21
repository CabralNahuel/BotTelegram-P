# BotTelegram (monorepo público)

API en Node (`TelegramBot`) y panel de administración en React (`telegram-front`).

## Estructura

- `TelegramBot/` — servidor Express + grammY + MySQL (Sequelize).
- `telegram-front/` — Vite + React + MUI.

## Antes de clonar o publicar

- **No** subas archivos `.env`, `.env.production`, `.env.development` ni dumps de base de datos.
- Copiá los `*.example` a `.env.*` solo en tu máquina o en el servidor.
- Rotá **tokens** (Telegram, JWT, MySQL) si alguna vez filtraron en otro repo o chat.

## Variables de entorno

- Backend: ver `TelegramBot/.env.development.example` y `TelegramBot/.env.production.example`.
- Front: copiá `telegram-front/.env.example` a `.env.development` o `.env.production` y ajustá URLs (sin commitear).

## Arranque local (resumen)

1. MySQL y base creada según los modelos del proyecto.
2. `cd TelegramBot && npm install` — configurar `.env.development` y `npm run start:dev` (o el script que uses).
3. `cd telegram-front && npm install` — configurar `.env.development` y `npm run dev`.

## Seguridad en producción

- No uses el placeholder de `JWT_SECRET` ni contraseñas de ejemplo.
- El flujo de registro del bot puede crear usuarios con contraseña por defecto en código; revisalo antes de exponer el API públicamente.
