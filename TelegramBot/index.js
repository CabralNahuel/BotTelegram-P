const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
const envFile = `.env.${nodeEnv}`;
const root = process.cwd();

dotenv.config({ path: path.resolve(root, envFile) });
dotenv.config({ path: path.resolve(root, ".env") });

// PM2 a veces arranca sin NODE_ENV=production y solo existe .env.production en el servidor.
if (!process.env.TELEGRAM_BOT_TOKEN) {
  const prodEnv = path.resolve(root, ".env.production");
  if (fs.existsSync(prodEnv)) {
    dotenv.config({ path: prodEnv, override: true });
  }
}

const REQUIRED_ENV = [
  "TELEGRAM_BOT_TOKEN",
  "JWT_SECRET",
  "HOST",
  "MYSQL_USER",
  "PASS",
  "DATABASE",
  "PUBLIC_BASE_URL",
  "TELEGRAM_WEBHOOK_SECRET",
];

const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k] || !String(process.env[k]).trim());
if (missingEnv.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missingEnv.join(", ")}. ` +
      `Definilas en ${envFile}, en .env.production (carpeta ${root}), o en el panel de Render/PaaS.`
  );
}

const express = require("express");
const { Bot, webhookCallback } = require("grammy");
const {
  setearComandos,
  comandoStart,
  comandosDinamicos,
  manejarLlamada,
} = require("./controllers/comandos.controllers");
const { dbConect, dbSync } = require("./conexionDB/conexionDB");
const UsuarioMd = require("./models/model.usuario");
const authRoutes = require("./rutas/rutas");
const TokenMd = require("./models/model.token");
const cors = require("cors");
const menuRuter = require("./rutas/menu");

const app = express();
const PORT = process.env.PORT || 4005;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const WEBHOOK_PATH = `/telegram/webhook/${WEBHOOK_SECRET}`;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

// Rutas con prefijo público opcional (ver README).
const rawApiPrefix = (process.env.API_PUBLIC_PREFIX || "").trim();
const normalizedApiPrefix = rawApiPrefix
  ? rawApiPrefix.startsWith("/")
    ? rawApiPrefix.replace(/\/$/, "")
    : `/${rawApiPrefix.replace(/\/$/, "")}`
  : "";

// Health check público (Render + cron externo).
function healthPayload() {
  return { ok: true, uptime: process.uptime(), ts: new Date().toISOString() };
}
app.get("/health", (_req, res) => res.status(200).json(healthPayload()));
if (normalizedApiPrefix) {
  app.get(`${normalizedApiPrefix}/health`, (_req, res) => res.status(200).json(healthPayload()));
}

app.use("/", authRoutes);
app.use("/menu/", menuRuter);

if (normalizedApiPrefix) {
  app.use(normalizedApiPrefix, authRoutes);
  app.use(`${normalizedApiPrefix}/menu/`, menuRuter);
}

// --- Bot de Telegram ---
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const solicitudDeTokenPendiente = {};

bot.use(async (ctx, next) => {
  try {
    const userId = ctx.from && ctx.from.id;
    if (!userId) return next();

    const usuario = await UsuarioMd.findByPk(userId);

    if (!usuario && !solicitudDeTokenPendiente[userId]) {
      solicitudDeTokenPendiente[userId] = true;
      return ctx.reply(
        "No estás registrado. Por favor, proporciona un token para registrarte."
      );
    }

    await next();
  } catch (err) {
    console.error("Error al verificar el usuario:", err);
    return ctx.reply("Ocurrió un error al verificar tu estado.");
  }
});

bot.use(async (ctx, next) => {
  const userId = ctx.from && ctx.from.id;
  if (!userId) return next();

  if (solicitudDeTokenPendiente[userId]) {
    const token = ctx.message && ctx.message.text;
    try {
      const tokenExistente = await TokenMd.findOne();

      if (tokenExistente && tokenExistente.token == token) {
        // Contraseña aleatoria hasheada — evita exponer un default débil.
        const randomPassword = require("crypto").randomBytes(12).toString("base64url");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        await UsuarioMd.create({
          id: userId,
          username: ctx.from.username || String(userId),
          password: hashedPassword,
          token: tokenExistente.token,
          historial: [],
        });
        delete solicitudDeTokenPendiente[userId];

        await ctx.reply("Registro exitoso. Ahora puede usar el bot.");

        const usuario = await UsuarioMd.findByPk(userId);
        await comandoStart(ctx, usuario.historial);
      } else {
        return ctx.reply("Token no válido. Por favor, intente nuevamente.");
      }
    } catch (err) {
      console.error("Error al verificar el token:", err);
      return ctx.reply("Token no válido.");
    }
  } else {
    await next();
  }
});

setearComandos(bot);

bot.command(["start", "Start"], async (ctx) => {
  const usuarioId = ctx.from.id;
  const usuario = await UsuarioMd.findByPk(usuarioId);
  const historialUsuario = usuario ? usuario.historial : [];
  await comandoStart(ctx, historialUsuario);
});

bot.on(":text", async (ctx, next) => {
  try {
    if (!ctx.update || !ctx.update.message) {
      console.warn("ctx.update o ctx.update.message es null");
      return next();
    }

    const usuarioId = ctx.update.message.chat.id;
    const usuario = await UsuarioMd.findByPk(usuarioId);
    const historialUsuario = usuario ? usuario.historial : [];

    if (!solicitudDeTokenPendiente[usuarioId]) {
      historialUsuario.push(ctx.message.text);
      if (usuario) {
        await usuario.update({ historial: historialUsuario });
      }
    }

    await comandosDinamicos(ctx, historialUsuario, "", bot);
  } catch (error) {
    console.error("Error en el manejo de comandos dinámicos:", error);
    ctx.reply("Ocurrió un error mientras se procesaba tu solicitud.");
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    const usuarioId = ctx.from.id;
    const usuario = await UsuarioMd.findByPk(usuarioId);
    const historialUsuario = usuario ? usuario.historial : [];
    await manejarLlamada(ctx, historialUsuario, bot);
  } catch (error) {
    console.error("error en el manejo de la llamada de callback", error);
    ctx.reply("ocurrio un error mientras se procesa la llamada");
  }
});

// Endpoint webhook: Telegram hace POST acá. La ruta lleva el secret en el path
// y grammY valida además el header X-Telegram-Bot-Api-Secret-Token.
app.use(WEBHOOK_PATH, webhookCallback(bot, "express", {
  secretToken: WEBHOOK_SECRET,
}));

async function start() {
  await dbConect();
  await dbSync();

  await bot.init();

  const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });

  const webhookUrl = `${PUBLIC_BASE_URL}${WEBHOOK_PATH}`;
  try {
    await bot.api.setWebhook(webhookUrl, {
      secret_token: WEBHOOK_SECRET,
      drop_pending_updates: true,
    });
    console.log(`Webhook registrado: ${webhookUrl}`);
  } catch (err) {
    console.error("No se pudo registrar el webhook:", err);
  }

  const shutdown = async (signal) => {
    console.log(`Recibido ${signal}, cerrando...`);
    try {
      await bot.api.deleteWebhook().catch(() => {});
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    } catch (err) {
      console.error("Error en shutdown:", err);
      process.exit(1);
    }
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Error al iniciar la aplicación:", err);
  process.exit(1);
});

module.exports = { bot };
