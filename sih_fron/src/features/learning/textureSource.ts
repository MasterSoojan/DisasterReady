"use client";
import { useEffect, useState } from "react";

/**
 * Decode optional artwork before handing it to Drei's throwing Suspense loader.
 * An inline copy avoids a second network load; failures simply omit the artwork.
 */
export function loadTextureSource(
  url: string,
  ready: (source: string) => void,
): () => void {
  const picture = new Image();
  let active = true;
  const dispose = () => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    picture.onload = picture.onerror = null;
    picture.removeAttribute("src");
  };
  const timer = setTimeout(dispose, 8000);
  picture.crossOrigin = "anonymous";
  picture.onerror = dispose;
  picture.onload = () => {
    if (!active) return;
    let source: string | null = null;
    let canvas: HTMLCanvasElement | null = null;
    try {
      const { naturalWidth: width, naturalHeight: height } = picture;
      if (width > 0 && height > 0 && width <= 4096 && height <= 4096) {
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(picture, 0, 0);
          const encoded = canvas.toDataURL("image/png");
          if (encoded.startsWith("data:image/png;base64,")) source = encoded;
        }
      }
    } catch {
      // Decode, canvas or cross-origin restrictions make this decoration unavailable.
    } finally {
      if (canvas) canvas.width = canvas.height = 0;
    }
    dispose();
    if (source) ready(source);
  };
  try {
    picture.src = url;
  } catch {
    dispose();
  }
  return dispose;
}

export function useTextureSource(url: string) {
  const [loaded, setLoaded] = useState<{ url: string; source: string } | null>(
    null,
  );
  useEffect(
    () => loadTextureSource(url, (source) => setLoaded({ url, source })),
    [url],
  );
  return loaded?.url === url ? loaded.source : null;
}
