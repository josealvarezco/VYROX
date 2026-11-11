// The backend's address: empty in development, where Vite proxies /api to it, and the Render URL in production
// (VITE_API_URL, set in Vercel).
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
