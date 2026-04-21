const path = require("path");

module.exports = {
  apps: [
    {
      name: "TelegramBot",
      script: "./index.js",
      cwd: path.resolve(__dirname),
      env: {
        NODE_ENV: "production",
      },
      // En servidor: sin watch evita reinicios raros; para desarrollo local usá `npm run start:dev` o watch aparte.
      watch: false,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      // PORT y credenciales: definilas en el servidor (.env.production) o con `pm2 start ecosystem.config.js --update-env`.
      max_memory_restart: "400M",
    },
  ],
};
