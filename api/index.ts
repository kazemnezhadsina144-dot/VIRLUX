import app from "../apps/api/src/app";
import { initTelegramTransport } from "../apps/api/src/telegram/webhook";

let telegramReady = false;

app.use((_req, _res, next) => {
  if (!telegramReady) {
    telegramReady = true;
    void initTelegramTransport().catch(() => {});
  }
  next();
});

export default app;
