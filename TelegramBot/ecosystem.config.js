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
      // En servidor: sin watch evita reinicios raros; para desarrollo local usá `npm run dev` o watch aparte.
      watch: false,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
