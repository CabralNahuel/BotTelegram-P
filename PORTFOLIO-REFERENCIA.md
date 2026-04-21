# Referencia para portfolio — BotTelegram

Monorepo con **API Node** para un bot de Telegram y **panel web** para administrar menús, temas, mensajes, usuarios y estadísticas. Podés borrar este archivo cuando ya no lo necesites; el `README.md` del repo queda como guía técnica mínima.

---

## Qué hace el proyecto (en una frase)

Backend que expone **REST** (login con JWT, CRUD de menús/temas/mensajes, tokens) y corre el **bot** con la API de Telegram; frontend **SPA** para operar esa API de forma visual.

---

## Stack — backend (`TelegramBot/`)

| Área | Tecnología |
|------|------------|
| Runtime | **Node.js** (JavaScript) |
| HTTP | **Express** |
| Bot Telegram | **grammY** |
| ORM / BD | **Sequelize** + **MySQL** (`mysql2`) |
| Auth API | **jsonwebtoken** (JWT), **bcrypt** |
| Config | **dotenv** (entornos `development` / `production`) |
| CORS | **cors** |
| Utilidades | **cross-env**, **socks-proxy-agent** (dependencia del stack) |

*Nota:* el `package.json` incluye también `sqlite3` en dependencias; el código de conexión principal está orientado a **MySQL**.

---

## Stack — frontend (`telegram-front/`)

| Área | Tecnología |
|------|------------|
| Lenguaje | **TypeScript** |
| UI | **React 18** |
| Build / dev server | **Vite 5** |
| Componentes y estilos | **Material UI (MUI) v5** + **Emotion** |
| Enrutado | **React Router v6** |
| Estado global | **Redux Toolkit** + **React Redux** |
| HTTP | **fetch** centralizado (`api/client.ts`); **axios** en dependencias donde aplique |
| Gráficos | **Recharts** |
| Seguridad en HTML | **DOMPurify** (+ utilidades de sanitización propias) |
| Identificadores | **uuid** |
| Lint | **ESLint** + **TypeScript ESLint** |

---

## Patrones y prácticas que podés mencionar

- Separación **API / cliente** y variables de entorno para URLs y secretos.
- **Rutas protegidas** en el front (sesión / flujo de login).
- **Proxy / prefijo de API** configurable (`VITE_API_BASE_URL`, `VITE_API_PATH_PREFIX`).
- **Base path** del SPA alineado con Vite (`base` en `vite.config.ts`).
- Panel con tablas, diálogos, editor de mensajes con formato (negrita/cursiva, etc.).

---

## Infra / despliegue (genérico)

- **Node** en servidor (p. ej. **PM2** vía `ecosystem.config.js` en el backend).
- **MySQL** como base de datos relacional.
- **Nginx** (u otro reverse proxy) para HTTPS y enrutar `/apis/...` hacia el Node y estáticos del build de Vite.

---

## Palabras clave para CV o LinkedIn

Node.js · Express · REST API · Telegram Bot API · grammY · JWT · Sequelize · MySQL · React · TypeScript · Vite · Material UI · Redux Toolkit · React Router · Recharts
