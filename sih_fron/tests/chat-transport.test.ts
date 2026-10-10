import { afterEach, expect, it, vi } from "vitest";
import { sendChat } from "../src/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
function setup() {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000/");
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ user_message: "hello", bot_response: "A demo reply" }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
it("sends one trimmed bounded message with the exact configured endpoint", async () => {
  const fetcher = setup();
  expect(await sendChat(" hello ")).toEqual({
    user_message: "hello",
    bot_response: "A demo reply",
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toBe("http://localhost:8000/chat");
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
    message: "hello",
  });
  expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});
it("rejects blank/oversized messages and pre-cancelled requests before network work", async () => {
  const fetcher = setup();
  for (const value of ["", " ", "x".repeat(4001)])
    await expect(sendChat(value)).rejects.toThrow(/1–4000/);
  await expect(sendChat("hello", AbortSignal.abort())).rejects.toMatchObject({
    name: "AbortError",
  });
  expect(fetcher).not.toHaveBeenCalled();
});
it("rejects absent or unsafe endpoint configuration without making a request", async () => {
  const fetcher = setup();
  for (const base of [
    "",
    "not-a-url",
    "file:///tmp/private",
    "https://name:secret@example.test",
    "https://example.test/?token=secret",
    "https://example.test/#fragment",
  ]) {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", base);
    await expect(sendChat("hello")).rejects.toThrow(
      /not configured|URL is invalid/,
    );
  }
  expect(fetcher).not.toHaveBeenCalled();
});
it("does not turn malformed, mismatched or empty service replies into assistant messages", async () => {
  const fetcher = setup();
  for (const value of [
    "{broken",
    "null",
    JSON.stringify([]),
    JSON.stringify({ user_message: "someone else", bot_response: "text" }),
    JSON.stringify({ user_message: "hello", bot_response: " " }),
    JSON.stringify({ user_message: "hello", bot_response: 7 }),
    JSON.stringify({ user_message: "hello", bot_response: "x".repeat(8001) }),
  ]) {
    fetcher.mockResolvedValueOnce(new Response(value));
    await expect(sendChat("hello")).rejects.toThrow(/invalid response/);
  }
});
it("redacts provider/network failures and never retries a dispatched write", async () => {
  const fetcher = setup();
  fetcher.mockResolvedValueOnce(
    new Response("private provider diagnostics", { status: 503 }),
  );
  await expect(sendChat("hello")).rejects.toThrow(
    "Chat is unavailable. Please try again.",
  );
  fetcher.mockRejectedValueOnce(new Error("private URL and internals"));
  await expect(sendChat("hello")).rejects.toThrow(
    "The chat service could not be reached.",
  );
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("aborts stalled transport at ten seconds and clears the owned timer", async () => {
  vi.useFakeTimers();
  const fetcher = setup();
  fetcher.mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        ),
      ),
  );
  const task = sendChat("hello");
  const rejection = expect(task).rejects.toThrow(/took too long/);
  await vi.advanceTimersByTimeAsync(10000);
  await rejection;
  expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
it("caller cancellation is distinguishable and successful/error responses release their timers", async () => {
  vi.useFakeTimers();
  const fetcher = setup();
  await sendChat("hello");
  expect(vi.getTimerCount()).toBe(0);
  fetcher.mockResolvedValueOnce(new Response("bad json"));
  await expect(sendChat("hello")).rejects.toThrow(/invalid/);
  expect(vi.getTimerCount()).toBe(0);
  fetcher.mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        ),
      ),
  );
  const controller = new AbortController();
  const task = sendChat("hello", controller.signal);
  controller.abort();
  await expect(task).rejects.toMatchObject({ name: "AbortError" });
  expect(vi.getTimerCount()).toBe(0);
});
