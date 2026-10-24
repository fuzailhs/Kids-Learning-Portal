import { createHmac } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { unauthorized } from "./errors.js";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * The browser keeps a random, anonymous session id in localStorage. The server
 * only ever stores a one-way HMAC of that id, never the raw value or any IP,
 * user-agent, name, email, or other personal detail.
 */
export function hashSession(rawSessionId: string): string {
  return createHmac("sha256", config.sessionSalt).update(rawSessionId).digest("hex");
}

export function requireSession(req: Request, res: Response, next: NextFunction): void {
  const raw = req.header("x-session-id")?.trim() ?? "";
  if (!SESSION_ID_PATTERN.test(raw)) {
    next(unauthorized('Start a learning session first. No account is needed.'));
    return;
  }
  res.locals.sessionHash = hashSession(raw);
  next();
}

export function getSessionHash(res: Response): string {
  const value = res.locals.sessionHash;
  if (typeof value !== "string" || value.length === 0) {
    throw unauthorized();
  }
  return value;
}
