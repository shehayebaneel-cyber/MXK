const TOKEN_KEY = "mxk-admin-token";

// In dev the Vite proxy forwards /api to the local backend; in production set
// VITE_API_URL to the deployed API origin.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

/** Resolve a possibly-relative "/api/..." media path to the API host. */
export const mediaUrl = (path: string | null | undefined): string => (path && path.startsWith("/api/") ? API_BASE + path : (path ?? ""));

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let message = "Something went wrong.";
    try {
      message = (await res.json()).error ?? message;
    } catch {
      /* non-JSON */
    }
    throw new ApiError(res.status, message);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
