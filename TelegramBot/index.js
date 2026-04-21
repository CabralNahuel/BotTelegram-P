const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

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

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error(
    `Falta TELEGRAM_BOT_TOKEN. Definila en ${envFile}, en .env, en .env.production (carpeta ${root}), ` +
      `o en el entorno. NODE_ENV="${process.env.NODE_ENV ?? ""}" (vacío ⇒ se intentó .env.development primero).`
  );
}

const express = require("express");
const { Bot } = require("grammy");
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
const PORT = process.env.PORT;

app.use(cors());

// Middleware para parsear el cuerpo de la solicitud
app.use(express.json());

// Conexión a la base de datos
dbConect();
dbSync();

/**
 * Rutas del panel en la raíz (/login, /home/..., /menu/...) para cuando el proxy QUITA el prefijo
 * (p. ej. ProxyPass .../ http://127.0.0.1:4001/).
 * Si además definís API_PUBLIC_PREFIX=/apis/infobot, se duplican bajo ese prefijo para cuando el proxy
 * reenvía la URL completa. Así el front puede usar siempre .../apis/infobot/... en el navegador.
 */
const rawApiPrefix = (process.env.API_PUBLIC_PREFIX || "").trim();
const normalizedApiPrefix = rawApiPrefix
  ? rawApiPrefix.startsWith("/")
    ? rawApiPrefix.replace(/\/$/, "")
    : `/${rawApiPrefix.replace(/\/$/, "")}`
  : "";

app.use("/", authRoutes);
app.use("/menu/", menuRuter);

if (normalizedApiPrefix) {
  app.use(normalizedApiPrefix, authRoutes);
  app.use(`${normalizedApiPrefix}/menu/`, menuRuter);
}

// Creación del bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Middleware de autenticación para el bot
let solicitudDeTokenPendiente = {};

// Middleware global para verificar la existencia del usuario
bot.use(async (ctx, next) => {
  try {
    const userId = ctx.from.id;

    // Verificar si el usuario existe en la base de datos
    const usuario = await UsuarioMd.findByPk(userId);

    if (!usuario && !solicitudDeTokenPendiente[userId]) {
      // Si el usuario no existe y no ha solicitado token, solicitar registro
      solicitudDeTokenPendiente[userId] = true;
      return ctx.reply(
        "No estás registrado. Por favor, proporciona un token para registrarte."
      );
    }

    // Si el usuario ya está registrado o está en proceso de registro, continuar
    await next();
  } catch (err) {
    console.error("Error al verificar el usuario:", err);
    return ctx.reply("Ocurrió un error al verificar tu estado.");
  }
});

// Middleware para manejo de tokens
bot.use(async (ctx, next) => {
  const userId = ctx.from.id;

  if (solicitudDeTokenPendiente[userId]) {
    const token = ctx.message.text;
    try {
      // Verificar si el token existe en la base de datos
      const tokenExistente = await TokenMd.findOne();

      // Si el token que le pasó es igual al token que está en la base, continuar
      if (tokenExistente.token == token) {
        // Crear un nuevo usuario con el userId y token
        await UsuarioMd.create({
          id: userId,
          username: ctx.from.username || userId,
          password: "1234",
          token: tokenExistente.token,
          historial: [],
        });
        delete solicitudDeTokenPendiente[userId];

        await ctx.reply("Registro exitoso. Ahora puede usar el bot.");

        // Iniciar el comando /start explícitamente
        const usuario = await UsuarioMd.findByPk(userId);
        await comandoStart(ctx, usuario.historial);
      } else {
        console.log(token);
        return ctx.reply("Token no válido. Por favor, intente nuevamente.");
      }
    } catch (err) {
      console.error("Error al verificar el token:", err);
      return ctx.reply("Token no válido.");
    }
  } else {
    // No guardar token en historial
    await next();
  }
});

// Configurar comandos
setearComandos(bot);

// Manejador del comando /start
bot.command(["start", "Start"], async (ctx) => {
  const usuarioId = ctx.from.id;
  const usuario = await UsuarioMd.findByPk(usuarioId);

  console.log(usuario);
  const historialUsuario = usuario ? usuario.historial : [];
  await comandoStart(ctx, historialUsuario);
});

// Manejador de comandos dinámicos
bot.on(":text", async (ctx, next) => {
  try {
    if (!ctx.update || !ctx.update.message) {
      console.warn("ctx.update o ctx.update.message es null");
      return next();
    }

    const usuarioId = ctx.update.message.chat.id;
    const usuario = await UsuarioMd.findByPk(usuarioId);
    const historialUsuario = usuario ? usuario.historial : [];

    // Verifica si el mensaje no es un token antes de agregar al historial
    if (!solicitudDeTokenPendiente[usuarioId]) {
      // Agregar el comando recibido al historial del usuario
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

// Manejador de eventos para botones
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

// Iniciar el bot
try {
  bot.start();
  console.log("bot inicio correctamente");
} catch (error) {
  console.error("Error al iniciar el bot", error);
}
// Iniciar el servidor Express
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = { bot };
