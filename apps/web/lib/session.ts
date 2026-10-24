const SESSION_KEY = "klp.anonymous-session.v1";

/**
 * A random id kept only in this browser. The API stores just an HMAC of it, so
 * no name, email, birthday, location, or device detail is ever collected.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = window.crypto.randomUUID();

  window.localStorage.setItem(SESSION_KEY, id);
  return id;
}
