export const MAX_AVATAR_BYTES = 256 * 1024;
const mimeTypes = ["image/png", "image/jpeg", "image/webp"];

/** Only bounded inline raster images are displayed; legacy URLs remain stored but are not fetched. */
export function isAvatarData(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > Math.ceil(MAX_AVATAR_BYTES / 3) * 4 + 40
  )
    return false;
  const match =
    /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(
      value,
    );
  if (!match) return false;
  try {
    const bytes = atob(match[2]);
    if (bytes.length > MAX_AVATAR_BYTES) return false;
    if (match[1] === "image/png") return bytes.startsWith("\x89PNG\r\n\x1a\n");
    if (match[1] === "image/jpeg") return bytes.startsWith("\xff\xd8\xff");
    return bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP";
  } catch {
    return false;
  }
}

/** FileReader and image decoding are bounded and cancelled together; no object URLs are persisted. */
export function readAvatar(file: File, signal: AbortSignal): Promise<string> {
  if (
    !mimeTypes.includes(file.type) ||
    file.size < 1 ||
    file.size > MAX_AVATAR_BYTES
  ) {
    return Promise.reject(
      new Error("Choose a PNG, JPEG or WebP image up to 256 KiB."),
    );
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Image loading cancelled.", "AbortError"));
      return;
    }
    const reader = new FileReader();
    const preview = new Image();
    let settled = false;
    const finish = (failure?: Error, result?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reader.onload = reader.onerror = reader.onabort = null;
      preview.onload = preview.onerror = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
      preview.removeAttribute("src");
      if (failure) reject(failure);
      else resolve(result!);
    };
    const cancel = () =>
      finish(new DOMException("Image loading cancelled.", "AbortError"));
    const timer = setTimeout(
      () =>
        finish(new Error("Image loading took too long. Try another image.")),
      10000,
    );
    signal.addEventListener("abort", cancel, { once: true });
    reader.onerror = () => finish(new Error("Unable to read this image."));
    reader.onabort = cancel;
    reader.onload = () => {
      const result = reader.result;
      if (!isAvatarData(result)) {
        finish(new Error("The file is not a supported raster image."));
        return;
      }
      preview.onload = () => {
        if (
          preview.naturalWidth < 1 ||
          preview.naturalHeight < 1 ||
          preview.naturalWidth > 4096 ||
          preview.naturalHeight > 4096
        ) {
          finish(
            new Error("Image dimensions must be between 1 and 4096 pixels."),
          );
        } else finish(undefined, result);
      };
      preview.onerror = () =>
        finish(new Error("The image could not be decoded. Try another file."));
      preview.src = result;
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      finish(new Error("Unable to read this image."));
    }
  });
}
