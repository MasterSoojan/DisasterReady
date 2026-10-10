/** Stable visual variation: identical on server/client and across re-renders.
 * Only for decorative layouts, never game outcomes or security-sensitive values.
 */
export function decorationValue(index: number, channel = 0): number {
  const value =
    Math.sin((index + 1) * 127.1 + (channel + 1) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
