import { afterEach, expect, it, vi } from "vitest";
import { loadTextureSource } from "../src/features/learning/textureSource";

const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXF8AAAAASUVORK5CYII=";
class Picture {
  static latest: Picture;
  naturalWidth = 2;
  naturalHeight = 3;
  crossOrigin = "";
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  removeAttribute = vi.fn();
  constructor() {
    Picture.latest = this;
  }
}
function setup() {
  vi.useFakeTimers();
  vi.stubGlobal("Image", Picture);
  const drawing = { drawImage: vi.fn() };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => drawing),
    toDataURL: vi.fn(() => png),
  };
  const createElement = vi.fn(() => canvas);
  vi.stubGlobal("document", { createElement });
  return { canvas, drawing, createElement };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("decodes once, delivers inline artwork and releases the image/canvas/timer resources", () => {
  const { canvas, drawing } = setup();
  const ready = vi.fn();
  const dispose = loadTextureSource("/fixture.png", ready);
  expect(Picture.latest.src).toBe("/fixture.png");
  expect(Picture.latest.crossOrigin).toBe("anonymous");
  Picture.latest.onload!();
  expect(drawing.drawImage).toHaveBeenCalledWith(Picture.latest, 0, 0);
  expect(ready).toHaveBeenCalledExactlyOnceWith(png);
  expect(canvas.width).toBe(0);
  expect(canvas.height).toBe(0);
  expect(Picture.latest.onload).toBeNull();
  expect(Picture.latest.onerror).toBeNull();
  expect(Picture.latest.removeAttribute).toHaveBeenCalledWith("src");
  expect(vi.getTimerCount()).toBe(0);
  dispose();
  expect(ready).toHaveBeenCalledTimes(1);
});
it("failed images, invalid dimensions and unavailable canvas omit decoration without throwing", () => {
  const { canvas, createElement } = setup();
  const ready = vi.fn();
  loadTextureSource("/missing.png", ready);
  Picture.latest.onerror!();
  for (const width of [0, 4097]) {
    loadTextureSource("/invalid.png", ready);
    Picture.latest.naturalWidth = width;
    Picture.latest.onload!();
  }
  expect(createElement).not.toHaveBeenCalled();
  canvas.getContext.mockReturnValue(null as never);
  loadTextureSource("/unavailable.png", ready);
  Picture.latest.onload!();
  expect(ready).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
it("cross-origin/encoding failures are handled and temporary pixel buffers are released", () => {
  const { canvas } = setup();
  const ready = vi.fn();
  canvas.toDataURL.mockImplementationOnce(() => {
    throw new DOMException("Tainted", "SecurityError");
  });
  loadTextureSource("https://fixture.example/image.png", ready);
  expect(() => Picture.latest.onload!()).not.toThrow();
  expect(canvas.width).toBe(0);
  canvas.toDataURL.mockReturnValueOnce("data:,");
  loadTextureSource("/empty.png", ready);
  Picture.latest.onload!();
  expect(ready).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
it("timeout/unmount detach handlers and late image completion cannot update a new view", async () => {
  setup();
  const ready = vi.fn();
  const dispose = loadTextureSource("/slow.png", ready);
  const late = Picture.latest.onload!;
  dispose();
  late();
  expect(ready).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
  loadTextureSource("/stalled.png", ready);
  const later = Picture.latest.onload!;
  await vi.advanceTimersByTimeAsync(8000);
  later();
  expect(Picture.latest.onload).toBeNull();
  expect(Picture.latest.onerror).toBeNull();
  expect(ready).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
