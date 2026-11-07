// ALL Fetch API calls live in this file.
// The base URL comes from an environment variable, never hard-coded.
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => request("/api/health"),
  // Frontend team: add the rest below, e.g.
  // getMenu: () => request("/api/menu"),
  // placeOrder: (order) => request("/api/orders", { method: "POST", body: JSON.stringify(order) }),
};
