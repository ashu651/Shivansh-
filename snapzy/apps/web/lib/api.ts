const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}/v1${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
  return data;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};