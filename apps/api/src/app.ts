import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import catalogRouter from "./routes/catalog.js";
import facilitatorRouter from "./routes/facilitator.js";
import progressRouter from "./routes/progress.js";
import quizRouter from "./routes/quiz.js";
import { errorHandler, requestId } from "./lib/errors.js";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "X-Session-Id"],
      exposedHeaders: ["X-Request-Id"],
      maxAge: 86_400,
    }),
  );
  app.use(express.json({ limit: "16kb", strict: true }));
  app.use(requestId);

  // Log method, path, and status only. Request bodies are never logged.
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      console.log(
        `${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`,
      );
    });
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", catalogRouter);
  app.use("/api", quizRouter);
  app.use("/api", progressRouter);
  app.use("/api", facilitatorRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: "Not found.",
      requestId: String(res.locals.requestId ?? "unknown"),
    });
  });

  app.use(errorHandler);
  return app;
}
