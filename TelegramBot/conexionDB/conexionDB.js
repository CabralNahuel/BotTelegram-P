const { Sequelize } = require("sequelize");

const useSsl = String(process.env.DB_SSL).toLowerCase() === "true";

const db = new Sequelize({
  dialect: "mysql",
  host: process.env.HOST,
  username: process.env.MYSQL_USER,
  password: process.env.PASS,
  database: process.env.DATABASE,
  port: process.env.MYSQLPORT,
  pool: { max: 5, min: 0 },
  timezone: "-03:00",
  logging: false,
  dialectOptions: useSsl
    ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
    : {},
});

const dbConect = async () => {
  try {
    await db.authenticate();
    console.log("Estableció la conexión");
  } catch (err) {
    console.error("No se pudo conectar", err);
  }
};

const dbSync = async () => {
  try {
    await db.sync();
    console.log("Se sincronizó con la BD");
  } catch (err) {
    console.error("No se pudo sincronizar BD", err);
  }
};

module.exports = {
  db,
  dbConect,
  dbSync,
};
