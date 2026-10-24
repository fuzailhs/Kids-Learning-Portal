import type { NextFunction, Request, Response } from "express";

/** An error that is safe to show to a child or facilitator. */
export class ApiError extends Error {
  readonly status: number;
  readonly publicMessage: string;

  constructor(status: number, publicMessage: string) {
    super(publicMessage);
    this.name = "ApiError";
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

export function notFound(message = "Not found."): ApiError {
  return new ApiError(404, message);
}

export function badRequest(message = "That request was not valid."): ApiError {
  return new ApiError(400, message);
}

export function unauthorized(message = "A learning session is required."): ApiError {
  return new ApiError(401, message);
}

export function tooManyRequests(message = "Please wait a moment and try again."): ApiError {
  return new ApiError(429, message);
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = crypto.randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}

function isBodyParseError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.parse.failed"
  );
}

/**
 * Central error handler. Never returns stack traces, provider output, or
 * request bodies. Every error carries a request id for support.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestIdValue = String(res.locals.requestId ?? "unknown");

  if (error instanceof ApiError) {
    if (error.status >= 500) {
      console.error(`[${requestIdValue}] api_error`, error.message);
    }
    res.status(error.status).json({
      error: error.publicMessage,
      requestId: requestIdValue,
    });
    return;
  }

  if (isBodyParseError(error)) {
    res.status(400).json({
      error: "That request was not valid.",
      requestId: requestIdValue,
    });
    return;
  }

  console.error(
    `[${requestIdValue}] unhandled_error`,
    error instanceof Error ? error.message : "unknown error",
  );
  res.status(500).json({
    error: "Something went wrong. Please try again.",
    requestId: requestIdValue,
  });
}

/** Reject request bodies for endpoints that accept no input. */
export function rejectRequestBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body as unknown;
  if (
    body !== undefined &&
    body !== null &&
    (typeof body !== "object" || Object.keys(body as Record<string, unknown>).length > 0)
  ) {
    next(badRequest("This request does not accept any data."));
    return;
  }
  next();
}
