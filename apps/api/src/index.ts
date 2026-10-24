import { createApp } from "./app.js";
import { config } from "./config.js";
import { closeDb, getDb } from "./db/index.js";

async function main(): Promise<void> {
  await getDb();

  if (config.ai.provider === "stub") {
    console.warn(
      "AI_PROVIDER=stub: quizzes come from the offline sample bank. Set AI_PROVIDER=openai and AI_API_KEY for live generation.",
    );
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`Kids Learning Portal API listening on http://localhost:${config.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received, shutting down.`);
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error: unknown) => {
  console.error(
    "API failed to start:",
    error instanceof Error ? error.message : "unknown error",
  );
  process.exit(1);
});
