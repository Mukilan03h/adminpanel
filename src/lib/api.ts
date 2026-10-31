/**
 * API client for the PeopleHub FastAPI backend.
 *
 * Activated only when `VITE_API_URL` is set ("connected mode"). When it is
 * unset the app runs fully standalone on local mock data ("demo mode").
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
export const isApiConfigured = Boolean(BASE);

const ACCESS_KEY = "ph-access";
const REFRESH_KEY = "ph-refresh";

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh?: string) {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    /* ignore */
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return true;
}

type RequestOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  _retry?: boolean;
};

export async function request<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", body, auth = true, _retry = false } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !_retry) {
    if (await tryRefresh()) {
      return request<T>(path, { ...opts, _retry: true });
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ------------------------- typed endpoint helpers -------------------------

export type TokenPair = { access_token: string; refresh_token: string };
export type LoginResponse = {
  mfa_required: boolean;
  tokens: TokenPair | null;
  mfa_token: string | null;
  methods: string[] | null;
};
export type MeResponse = {
  user: {
    id: number;
    email: string;
    full_name: string;
    title: string;
    is_active: boolean;
    hue: number;
    mfa_enabled: boolean;
    roles: string[];
  };
  permissions: string[];
  is_superuser: boolean;
};
export type ApiRole = {
  id: string;
  name: string;
  description: string;
  hue: number;
  is_system: boolean;
  is_superuser: boolean;
  permissions: string[];
};
export type ApiUser = {
  id: number;
  email: string;
  full_name: string;
  title: string;
  is_active: boolean;
  hue: number;
  mfa_enabled: boolean;
  roles: string[];
};
export type MfaSetup = {
  secret: string;
  otpauth_uri: string;
  qr_data_uri: string;
  backup_codes: string[];
};

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", auth: false, body: { email, password } }),
  mfaVerify: (mfa_token: string, code: string) =>
    request<TokenPair>("/auth/mfa/verify", { method: "POST", auth: false, body: { mfa_token, code } }),
  mfaEmailStart: (mfa_token: string) =>
    request<{ detail: string; dev_otp: string | null }>("/auth/mfa/email/start", {
      method: "POST", auth: false, body: { mfa_token },
    }),
  me: () => request<MeResponse>("/auth/me"),
  logout: (refresh_token: string) =>
    request<{ detail: string }>("/auth/logout", { method: "POST", auth: false, body: { refresh_token } }),
  changePassword: (current_password: string, new_password: string) =>
    request<{ detail: string }>("/auth/password", { method: "POST", body: { current_password, new_password } }),

  mfaSetup: () => request<MfaSetup>("/auth/mfa/setup", { method: "POST" }),
  mfaEnable: (code: string) => request<{ detail: string }>("/auth/mfa/enable", { method: "POST", body: { code } }),
  mfaDisable: (code: string) => request<{ detail: string }>("/auth/mfa/disable", { method: "POST", body: { code } }),

  roles: () => request<ApiRole[]>("/rbac/roles"),
  createRole: (payload: { id: string; name: string; description: string; hue: number; permissions: string[] }) =>
    request<ApiRole>("/rbac/roles", { method: "POST", body: payload }),
  updateRole: (id: string, payload: Partial<{ name: string; description: string; hue: number; permissions: string[] }>) =>
    request<ApiRole>(`/rbac/roles/${id}`, { method: "PATCH", body: payload }),
  deleteRole: (id: string) => request<void>(`/rbac/roles/${id}`, { method: "DELETE" }),
  users: () => request<ApiUser[]>("/rbac/users"),
  assignRole: (userId: number, roleId: string) =>
    request<ApiUser>(`/rbac/users/${userId}/role`, { method: "POST", body: { role_id: roleId } }),
};

export function getRefreshTokenValue(): string | null {
  return getRefreshToken();
}
