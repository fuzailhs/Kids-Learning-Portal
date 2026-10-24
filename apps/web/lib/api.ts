export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;

export class ApiRequestError extends Error {
  readonly status: number;
  readonly requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.requestId = requestId;
  }
}

async function readError(response: Response): Promise<ApiRequestError> {
  let message = "Something went wrong. Please try again.";
  let requestId: string | undefined;
  try {
    const body = (await response.json()) as { error?: string; requestId?: string };
    if (typeof body.error === "string" && body.error.length > 0) message = body.error;
    if (typeof body.requestId === "string") requestId = body.requestId;
  } catch {
    // Keep the friendly fallback message.
  }
  return new ApiRequestError(message, response.status, requestId);
}

/** Used by server components; fails fast if the API is unavailable. */
export async function fetchServer<T>(path: string): Promise<T> {
  const response = await fetch(`${SERVER_API_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

/** Used by client components, with the anonymous session header. */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
  const { getOrCreateSessionId } = await import("./session");
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "X-Session-Id": getOrCreateSessionId(),
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
  });

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
