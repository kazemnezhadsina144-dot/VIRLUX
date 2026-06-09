import app from "./app";
import { config } from "./lib/config";
import { logger } from "./lib/logger";
import { initTelegramTransport } from "./telegram/webhook";

const port = config.port;

app.listen(port, () => {
  logger.info("VIRLUX API started", {
    port,
    env: config.env,
    autoSettle: config.autoSettle,
    settlementMode: config.settlementMode,
  });
  initTelegramTransport().catch((e) => logger.error("Telegram init failed", { err: String(e) }));
});
