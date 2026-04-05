"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getToken, removeToken, setToken as saveToken } from "@/lib/auth";
import type { AuthUser, MeResponse } from "@/lib/types";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMeRequest(token: string) {
  return apiRequest<MeResponse>("/api/auth/me", {
    method: "GET",
    token,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe(token: string) {
    const response = await fetchMeRequest(token);
    setUser(response.user);
  }

  useEffect(() => {
    async function initAuth() {
      const storedToken = getToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setTokenState(storedToken);
        await fetchMe(storedToken);
      } catch {
        removeToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void initAuth();
  }, []);

  async function login(token: string) {
    saveToken(token);
    setTokenState(token);
    await fetchMe(token);
  }

  function logout() {
    removeToken();
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
