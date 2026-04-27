const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const bcrypt = require("bcrypt");
const { Bot, webhookCallback } = require("grammy");

const {
  setearComandos,
  comandoStart,
  comandosDinamicos,
  manejarLlamada,
} = require("../../controllers/comandos.controllers");
const { dbConect, dbSync } = require("../../conexionDB/conexionDB");
const UsuarioMd = require("../../models/model.usuario");
const TokenMd = require("../../models/model.token");
const authRoutes = require("../../rutas/rutas");
const menuRouter = require("../../rutas/menu");

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
  throw new Error(`Faltan variables de entorno requeridas: ${missingEnv.join(", ")}`);
}

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const WEBHOOK_PATH = `/telegram/webhook/${WEBHOOK_SECRET}`;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL.replace(/\/$/, "");

const rawApiPrefix = (process.env.API_PUBLIC_PREFIX || "").trim();
const normalizedApiPrefix = rawApiPrefix
  ? rawApiPrefix.startsWith("/")
    ? rawApiPrefix.replace(/\/$/, "")
    : `/${rawApiPrefix.replace(/\/$/, "")}`
  : "";

const solicitudDeTokenPendiente = {};
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
let app;
let handler;
let initPromise;
let webhookRegistered = false;

bot.use(async (ctx, next) => {
  try {
    const userId = ctx.from && ctx.from.id;
    if (!userId) return next();

    const usuario = await UsuarioMd.findByPk(userId);
    if (!usuario && !solicitudDeTokenPendiente[userId]) {
      solicitudDeTokenPendiente[userId] = true;
      return ctx.reply("No estás registrado. Por favor, proporciona un token para registrarte.");
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

bot.command(["start", "Start"], async (ctx) => {
  const usuarioId = ctx.from.id;
  const usuario = await UsuarioMd.findByPk(usuarioId);
  const historialUsuario = usuario ? usuario.historial : [];
  await comandoStart(ctx, historialUsuario);
});

bot.on(":text", async (ctx, next) => {
  try {
    if (!ctx.update || !ctx.update.message) {
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
    console.error("Error en callback_query:", error);
    ctx.reply("Ocurrió un error mientras se procesa la llamada.");
  }
});

function healthPayload() {
  return { ok: true, uptime: process.uptime(), ts: new Date().toISOString(), runtime: "netlify-functions" };
}

async function init() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await dbConect();
    await dbSync();
    await bot.init();
    await setearComandos(bot);

    app = express();
    app.set("trust proxy", 1);
    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => res.status(200).json(healthPayload()));
    if (normalizedApiPrefix) {
      app.get(`${normalizedApiPrefix}/health`, (_req, res) => res.status(200).json(healthPayload()));
    }

    app.use("/", authRoutes);
    app.use("/menu/", menuRouter);
    if (normalizedApiPrefix) {
      app.use(normalizedApiPrefix, authRoutes);
      app.use(`${normalizedApiPrefix}/menu/`, menuRouter);
    }

    app.use(WEBHOOK_PATH, webhookCallback(bot, "express", { secretToken: WEBHOOK_SECRET }));

    handler = serverless(app);

    if (!webhookRegistered) {
      const webhookUrl = `${PUBLIC_BASE_URL}/.netlify/functions/api${WEBHOOK_PATH}`;
      try {
        await bot.api.setWebhook(webhookUrl, {
          secret_token: WEBHOOK_SECRET,
          drop_pending_updates: true,
        });
        webhookRegistered = true;
        console.log(`Webhook registrado: ${webhookUrl}`);
      } catch (err) {
        console.error("No se pudo registrar el webhook:", err);
      }
    }
  })();
  return initPromise;
}

module.exports.handler = async (event, context) => {
  await init();
  return handler(event, context);
};

