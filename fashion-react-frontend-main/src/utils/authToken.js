/** Normalize token from context/localStorage (may be JSON-stringified). */
export function normalizeAuthToken(token) {
  if (token == null) return null;
  if (typeof token === "string") {
    const t = token.trim();
    if (t.startsWith('"') && t.endsWith('"')) {
      try {
        return JSON.parse(t);
      } catch {
        return t.slice(1, -1);
      }
    }
    return t;
  }
  return String(token);
}

export function getOrderIdFromCheckoutResponse(response) {
  const order = response?.order ?? response?.data?.order ?? response?.data;
  return order?._id || order?.id || response?._id || response?.id || null;
}
