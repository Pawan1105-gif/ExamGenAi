const getBase = () => import.meta.env.VITE_API_URL || "";

export type ApiError = { success: false; error: string; details?: unknown };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (!(rest.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  if (token) {
    h.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${getBase()}${path}`, { ...rest, headers: h });
  const data = (await parseJson(res)) as T & ApiError;

  if (!res.ok) {
    const err = data as ApiError;
    const msg =
      err && typeof err === "object" && "error" in err && typeof err.error === "string"
        ? err.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}
