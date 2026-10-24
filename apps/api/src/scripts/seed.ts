import { seedDatabase } from "../data/seed.js";
import { closeDb } from "../db/index.js";

async function main(): Promise<void> {
  try {
    await seedDatabase();
  } finally {
    await closeDb();
  }
}

main().catch((error: unknown) => {
  console.error(
    "Seeding failed:",
    error instanceof Error ? error.message : "unknown error",
  );
  process.exitCode = 1;
});
