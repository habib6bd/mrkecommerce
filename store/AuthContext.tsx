"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getMe,
  login as loginRequest,
  refreshAccessToken,
  registerUser,
  updateProfile as updateProfileRequest,
} from "@/lib/api/auth";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/api/token";
import { User } from "@/types/user";

type Ctx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (input: { name?: string; phone?: string }) => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

/** Fired after a successful login/register so other contexts (cart/wishlist) can react. */
export const AUTH_LOGIN_EVENT = "mrk:auth-login";
export const AUTH_LOGOUT_EVENT = "mrk:auth-logout";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe(access);
        setToken(access);
        setUser(me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && refresh) {
          try {
            const { access: newAccess } = await refreshAccessToken(refresh);
            setTokens({ access: newAccess, refresh });
            const me = await getMe(newAccess);
            setToken(newAccess);
            setUser(me);
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password);
    setTokens(tokens);
    const me = await getMe(tokens.access);
    setToken(tokens.access);
    setUser(me);
    window.dispatchEvent(new CustomEvent(AUTH_LOGIN_EVENT, { detail: { token: tokens.access } }));
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; name?: string; phone?: string }) => {
      await registerUser(input);
      await login(input.email, input.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearTokens();
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
  }, []);

  const updateProfile = useCallback(
    async (input: { name?: string; phone?: string }) => {
      if (!token) throw new Error("Not authenticated");
      const me = await updateProfileRequest(token, input);
      setUser(me);
    },
    [token]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateProfile }),
    [user, token, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
