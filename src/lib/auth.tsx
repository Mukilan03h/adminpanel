import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshTokenValue,
  isApiConfigured,
  setTokens,
  type MeResponse,
} from "@/lib/api";

type AuthStatus = "loading" | "anonymous" | "authenticated";
type Mode = "demo" | "connected";

type MfaPending = { token: string; methods: string[] };

type AuthContextValue = {
  mode: Mode;
  status: AuthStatus;
  me: MeResponse | null;
  permissions: string[];
  isSuperuser: boolean;
  mfaPending: MfaPending | null;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  startEmailOtp: () => Promise<string | null>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: Mode = isApiConfigured ? "connected" : "demo";
  const [status, setStatus] = useState<AuthStatus>(mode === "connected" ? "loading" : "authenticated");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [mfaPending, setMfaPending] = useState<MfaPending | null>(null);

  const refreshMe = useCallback(async () => {
    const data = await api.me();
    setMe(data);
    setStatus("authenticated");
  }, []);

  // Bootstrap: if we already have a token, load the session.
  useEffect(() => {
    if (mode !== "connected") return;
    if (!getAccessToken()) {
      setStatus("anonymous");
      return;
    }
    refreshMe().catch(() => {
      clearTokens();
      setStatus("anonymous");
    });
  }, [mode, refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      if (res.mfa_required && res.mfa_token) {
        setMfaPending({ token: res.mfa_token, methods: res.methods ?? ["totp"] });
        return;
      }
      if (res.tokens) {
        setTokens(res.tokens.access_token, res.tokens.refresh_token);
        await refreshMe();
      }
    },
    [refreshMe],
  );

  const verifyMfa = useCallback(
    async (code: string) => {
      if (!mfaPending) throw new Error("No MFA challenge in progress");
      const tokens = await api.mfaVerify(mfaPending.token, code);
      setTokens(tokens.access_token, tokens.refresh_token);
      setMfaPending(null);
      await refreshMe();
    },
    [mfaPending, refreshMe],
  );

  const startEmailOtp = useCallback(async () => {
    if (!mfaPending) return null;
    const res = await api.mfaEmailStart(mfaPending.token);
    return res.dev_otp ?? null;
  }, [mfaPending]);

  const logout = useCallback(async () => {
    const refresh = getRefreshTokenValue();
    if (refresh) {
      try {
        await api.logout(refresh);
      } catch {
        /* ignore */
      }
    }
    clearTokens();
    setMe(null);
    setMfaPending(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      status,
      me,
      permissions: me?.permissions ?? [],
      isSuperuser: me?.is_superuser ?? false,
      mfaPending,
      login,
      verifyMfa,
      startEmailOtp,
      logout,
      refreshMe,
    }),
    [mode, status, me, mfaPending, login, verifyMfa, startEmailOtp, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
