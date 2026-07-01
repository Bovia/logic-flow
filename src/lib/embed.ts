/** Portfolio Hub iframe 嵌入检测 */
export function isEmbedMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("embed") === "1";
}
