# BotTelegram (monorepo público)

API en Node (`TelegramBot`) y panel de administración en React (`telegram-front`).

## Estructura

- `TelegramBot/` — servidor Express + grammY + MySQL (Sequelize). Bot en **modo webhook**.
- `telegram-front/` — Vite + React + MUI.

## Antes de clonar o publicar

- **No** subas archivos `.env`, `.env.production`, `.env.development` ni dumps de base de datos.
- Copiá los `*.example` a `.env.*` solo en tu máquina o en el servidor.
- Rotá **tokens** (Telegram, JWT, MySQL, webhook) si alguna vez filtraron en otro repo o chat.

## Variables de entorno

- Backend: ver `TelegramBot/.env.development.example` y `TelegramBot/.env.production.example`.
- Front: copiá `telegram-front/.env.example` a `.env.development` o `.env.production` y ajustá URLs (sin commitear).

## Arranque local (resumen)

1. MySQL local y base creada según los modelos del proyecto.
2. `cd TelegramBot && npm install` — configurar `.env.development` y `npm run start:dev`.
   - Para que el webhook funcione en local necesitás exponer el servidor con `ngrok` o `cloudflared` y poner esa URL pública en `PUBLIC_BASE_URL`. Si solo querés probar el API REST podés ignorar el bot.
3. `cd telegram-front && npm install` — configurar `.env.development` y `npm run dev`.

## Deploy gratis en Render + TiDB (portfolio-friendly)

Este es el camino "todo gratis" recomendado. Nada de tarjeta de crédito.

### 1. Base de datos — TiDB Cloud Serverless

1. Creá cuenta en [tidbcloud.com](https://tidbcloud.com) y un cluster **Serverless** (compatible MySQL).
2. Creá un usuario y una base vacía; anotá `host`, `user`, `password`, `database`, `port` (4000).
3. TiDB exige TLS: usá `DB_SSL=true`.

### 2. Web service — Render

1. Fork/subí el repo a GitHub y hacé **New > Blueprint** en Render apuntando a este repo (lee `render.yaml`).
2. En **Environment** cargá las variables listadas en `TelegramBot/.env.production.example` (incluyendo `DB_SSL=true`, `TELEGRAM_WEBHOOK_SECRET` aleatorio y `PUBLIC_BASE_URL` con la URL que te dio Render, ej. `https://telegram-bot-backend.onrender.com`). Render inyecta `PORT`.
3. Primer deploy: el bot registra automáticamente el webhook en `bot.api.setWebhook()` al arrancar. Health check: `GET /health`.

### 3. Evitar el spin-down

Render free duerme el servicio a los ~15 min sin tráfico HTTP. Cuando duerme, Telegram reintenta el webhook pero con timeout corto. Creá una tarea en [cron-job.org](https://cron-job.org) (gratis) que haga `GET https://TU-SERVICIO.onrender.com/health` cada 10 minutos.

### 4. Mejoras aplicadas para el deploy

- Bot migrado a **webhook** (`/telegram/webhook/<secret>`) con validación de `secret_token`.
- **SSL condicional** en Sequelize (`DB_SSL=true`) para TiDB/Aiven.
- **Graceful shutdown** con `SIGTERM`/`SIGINT` (Render usa SIGTERM en redeploy).
- **Validación de env vars** al inicio con mensaje claro si falta alguna.
- **Contraseña default** al registrar un usuario ahora es aleatoria y se guarda hasheada con bcrypt.
- Limpieza de dependencias no usadas (`sqlite3`, `socks-proxy-agent`, módulo `path`).

## Deploy alternativo — VPS

Node LTS, `cd TelegramBot && npm install`, `.env.production` en el servidor (sin commitear), `npm start` o `pm2 start ecosystem.config.js` desde `TelegramBot/`. Poné un reverse proxy (Nginx/Caddy) con HTTPS apuntando a `PUBLIC_BASE_URL`.

## Seguridad en producción

- No uses placeholders de `JWT_SECRET` ni contraseñas de ejemplo. Generá valores largos y aleatorios.
- El `TELEGRAM_WEBHOOK_SECRET` va en la URL **y** como header (`X-Telegram-Bot-Api-Secret-Token`), ambos validados.
- Revisá el flujo de registro del bot (`TelegramBot/index.js`) antes de exponer el API a un público amplio: hoy crea usuarios con password aleatoria, pero el modelo de autorización sigue siendo "quien conoce el token único se registra".
