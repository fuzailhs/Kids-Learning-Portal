import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function requiredInProduction(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (isProduction && !value) {
    throw new Error(
      `${name} is required in production. Set it in the service environment before starting the API.`,
    );
  }
  return value;
}

const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const aiProvider = (
  process.env.AI_PROVIDER?.trim() ||
  (process.env.AI_API_KEY?.trim() ? "openai" : "stub")
).toLowerCase();

if (aiProvider !== "stub" && aiProvider !== "openai") {
  throw new Error('AI_PROVIDER must be either "stub" or "openai".');
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  clientOrigins,
  sessionSalt: requiredInProduction("SESSION_HASH_SALT") || "local-development-salt-change-me",
  databaseUrl: process.env.DATABASE_URL?.trim() ?? "",
  pgSsl: process.env.PGSSL === "true",
  pgliteDataDir: process.env.PGLITE_DATA_DIR?.trim() || ".data/pglite",
  ai: {
    provider: aiProvider as "stub" | "openai",
    apiKey: process.env.AI_API_KEY?.trim() ?? "",
    baseUrl: (process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, ""),
    model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
  },
  facilitatorToken: process.env.FACILITATOR_TOKEN?.trim() ?? "",
};

if (isProduction && config.ai.provider === "openai" && !config.ai.apiKey) {
  throw new Error("AI_API_KEY is required when AI_PROVIDER=openai.");
}
