# Telegram-JavaScript-Bot

This repository is a template for creating a Telegram bot in JavaScript. It uses [grammY](https://grammy.dev)

# Features:
- Categories for commands
- Command handler (add commands in [commands](./commands))
- Error handler
- Command aliases (check [8ball](./commands/8ball.js) command, can add multiple aliases)

# Commands
- `/start` - Start the bot

### Categories

#### Utilities
- `/help` - Show help

#### Fun
- `/8ball` - Ask the magic 8-ball a question

# Environment Variables
- `TELEGRAM_BOT_TOKEN` - Telegram bot token, get it from [@BotFather](https://t.me/BotFather)
- `NODE_ENV` - `development` or `production`

The backend loads env files automatically by `NODE_ENV`:

- `NODE_ENV=development` -> `.env.development`
- `NODE_ENV=production` -> `.env.production`

If the specific file does not exist, it still falls back to `.env`.

Suggested setup:

- `.env.development`: test bot token and local DB values
- `.env.production`: real bot token and production DB values
- Use `.env.development.example` and `.env.production.example` as templates

# Deploying

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/5lRkWa?referralCode=agam778)

OR 

- Clone this repository
- Install dependencies: `yarn`
- Start the bot: `yarn start`

# License
Telegram-JavaScript-Bot is licensed under the [MIT License](./LICENSE)