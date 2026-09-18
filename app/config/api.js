export const API_BASE_URL = "https://api.reelo.buttnetworks.com";
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;

export function resolveMediaUrl(path) {
  if (!path) return null;
  let p = path;
  if (typeof p === "object") {
    p = p.url || p.path || p.content || p.file || p.src || null;
  }
  if (!p) return null;
  if (
    typeof p === "string" &&
    (p.startsWith("http://") || p.startsWith("https://"))
  )
    return p;
  return `${API_BASE_URL}/${String(p).replace(/\\/g, "/")}`;
}

export function isVideoItem(m) {
  if (!m) return false;
  if (m.contentType) return String(m.contentType).startsWith("video");
  if (typeof m === "string")
    return m.endsWith(".mp4") || m.endsWith(".mov") || m.endsWith(".webm");
  return false;
}