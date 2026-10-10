export interface ChatResponse {
  user_message: string;
  bot_response: string;
}
export const chatApiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

export async function sendChat(
  message: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("Chat backend is not configured.");
  let endpoint: URL;
  try {
    endpoint = new URL(base + "/chat");
    if (
      !["http:", "https:"].includes(endpoint.protocol) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    )
      throw new Error();
  } catch {
    throw new Error("The chat backend URL is invalid.");
  }
  const input = message.trim();
  if (!input || input.length > 4000)
    throw new Error("Write a message of 1–4000 characters.");
  if (signal?.aborted) throw new DOMException("Chat cancelled.", "AbortError");
  const timeout = new AbortController();
  const combined = signal
    ? AbortSignal.any([signal, timeout.signal])
    : timeout.signal;
  const timer = setTimeout(() => timeout.abort(), 10000);
  try {
    let response: Response;
    try {
      response = await fetch(endpoint.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
        signal: combined,
      });
    } catch {
      throw new Error("The chat service could not be reached.");
    }
    if (!response.ok) throw new Error("Chat is unavailable. Please try again.");
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new Error("The chat service returned an invalid response.");
    }
    if (
      typeof value !== "object" ||
      value === null ||
      !("user_message" in value) ||
      value.user_message !== input ||
      !("bot_response" in value) ||
      typeof value.bot_response !== "string" ||
      !value.bot_response.trim() ||
      value.bot_response.length > 8000
    )
      throw new Error("The chat service returned an invalid response.");
    return { user_message: input, bot_response: value.bot_response };
  } catch (error) {
    if (signal?.aborted)
      throw new DOMException("Chat cancelled.", "AbortError");
    if (timeout.signal.aborted)
      throw new Error("Chat took too long. Your draft is still available.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
