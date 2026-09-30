/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Global Auth Context & State Manager
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  xp: number;
  level: number;
  streak: number;
  targetCompany?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, college?: string, targetCompany?: string) => Promise<boolean>;
  continueAsGuest: () => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem("isGuest") === "true");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Validate Token / Profile on App Load
  useEffect(() => {
    async function initializeAuth() {
      const storedToken = localStorage.getItem("accessToken");
      const storedGuest = localStorage.getItem("isGuest") === "true";

      if (storedToken) {
        try {
          const res = await fetch("/api/auth/profile", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setUser(data.data);
            setIsGuest(false);
            localStorage.removeItem("isGuest");
          } else {
            // Attempt Refresh
            const refreshed = await tryRefreshToken();
            if (!refreshed) {
              handleForceLogout();
            }
          }
        } catch {
          handleForceLogout();
        }
      } else if (storedGuest) {
        setIsGuest(true);
        setUser({
          id: "guest",
          name: "Guest Student",
          email: "guest@algora.ai",
          role: "guest",
          xp: 0,
          level: 1,
          streak: 0,
        });
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data.accessToken) {
        const newAccess = data.data.accessToken;
        localStorage.setItem("accessToken", newAccess);
        setAccessToken(newAccess);

        // Retry profile with new token
        const profRes = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${newAccess}` },
        });
        const profData = await profRes.json();
        if (profRes.ok && profData.success) {
          setUser(profData.data);
          setIsGuest(false);
          localStorage.removeItem("isGuest");
          return true;
        }
      }
    } catch {
      // Refresh failed
    }

    handleForceLogout();
    return false;
  }

  function handleForceLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isGuest");
    setAccessToken(null);
    setUser(null);
    setIsGuest(false);
  }

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const { user: u, tokens } = data.data;
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.removeItem("isGuest");

        setAccessToken(tokens.accessToken);
        setUser(u);
        setIsGuest(false);
        return true;
      } else {
        setAuthError(data.error || "Login failed. Please check credentials.");
        return false;
      }
    } catch {
      setAuthError("Network error. Please try again.");
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    college?: string,
    targetCompany?: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass, college, targetCompany }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const { user: u, tokens } = data.data;
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.removeItem("isGuest");

        setAccessToken(tokens.accessToken);
        setUser(u);
        setIsGuest(false);
        return true;
      } else {
        setAuthError(data.error || "Registration failed.");
        return false;
      }
    } catch {
      setAuthError("Network error during registration.");
      return false;
    }
  };

  const continueAsGuest = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem("isGuest", "true");

    setAccessToken(null);
    setIsGuest(true);
    setUser({
      id: "guest",
      name: "Guest Student",
      email: "guest@algora.ai",
      role: "guest",
      xp: 0,
      level: 1,
      streak: 0,
    });
  };

  const logout = () => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token }),
      }).catch(() => {});
    }

    handleForceLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isGuest,
        isLoading,
        authError,
        login,
        register,
        continueAsGuest,
        logout,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
