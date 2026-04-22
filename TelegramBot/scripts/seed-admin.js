/*
 * Crea o actualiza un usuario admin con password hasheada (bcrypt).
 *
 * Uso local (en la carpeta TelegramBot/):
 *   node scripts/seed-admin.js <username> <password>
 *
 * Uso en Render (pestaña Shell del servicio):
 *   cd /opt/render/project/src/TelegramBot
 *   node scripts/seed-admin.js <username> <password>
 *
 * El script:
 *   - hashea la password con bcrypt (10 rounds).
 *   - si el usuario existe: actualiza password.
 *   - si no existe: lo crea con un id sintético (negativo, no colisiona con IDs reales de Telegram).
 */

const path = require("path");
const dotenv = require("dotenv");

const nodeEnv = process.env.NODE_ENV === "production" ? "production" : "development";
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(root, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(root, ".env") });
if (!process.env.HOST) {
  dotenv.config({ path: path.resolve(root, ".env.production") });
}

const bcrypt = require("bcrypt");
const { db } = require("../conexionDB/conexionDB");
const UsuarioMd = require("../models/model.usuario");

async function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error("Uso: node scripts/seed-admin.js <username> <password>");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("La password debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  try {
    await db.authenticate();
    const hash = await bcrypt.hash(password, 10);

    const existente = await UsuarioMd.findOne({ where: { username } });

    if (existente) {
      await existente.update({ password: hash });
      console.log(`Usuario "${username}" actualizado (password rehasheada).`);
    } else {
      // ID sintético negativo (Telegram no usa negativos para user IDs).
      const id = -Math.floor(Math.random() * 1_000_000_000) - 1;
      await UsuarioMd.create({
        id,
        username,
        password: hash,
        token: "admin-seed",
        historial: [],
      });
      console.log(`Usuario admin "${username}" creado con id=${id}.`);
    }

    await db.close();
    process.exit(0);
  } catch (err) {
    console.error("Error en seed-admin:", err.message || err);
    process.exit(1);
  }
}

main();
