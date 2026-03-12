"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  login as authLogin,
  logout as authLogout,
  me as authMe,
  register as authRegister,
  sendEmailVerification as authSendEmailVerification,
} from "@/lib/auth";
import { ApiHttpError } from "@/lib/httpClient";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, turnstileToken?: string | null) => Promise<{ success: boolean; message: string }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    consent_terms_accepted: boolean;
    consent_email_sms_opt_in: boolean;
    security_token?: string | null;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resendEmailVerification: () => Promise<{ success: boolean; message: string }>;
  refreshSession: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  if (typeof value === "number") return value === 1;
  return false;
}

function mapMeToAuthUser(payload: any): AuthUser | null {
  const source = payload?.data?.user || payload?.data || payload?.user || payload;
  if (!source) return null;

  const id = source.id?.toString?.() || source.userId?.toString?.() || source._id?.toString?.() || "";
  const firstName = (source.first_name || source.firstName || "").toString().trim();
  const lastName = (source.last_name || source.lastName || "").toString().trim();
  const fullNameFromParts = [firstName, lastName].filter(Boolean).join(" ").trim();
  const name = source.name || source.fullName || fullNameFromParts || source.username || source.displayName || source.email || "";
  const email = source.email || source.mail || source?.contact?.email || source?.user?.email || "";
  const phone = source.phone || source.mobile || source.telephone || undefined;
  const emailVerified = toBoolean(source.email_verified);

  if (!email) return null;
  return { id: id || email, name, email, phone, emailVerified };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveSession = useCallback(async () => {
    try {
      const result = await authMe();
      const profile = mapMeToAuthUser(result);
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    resolveSession().finally(() => setIsLoading(false));
  }, [resolveSession]);

  const login = useCallback(async (email: string, password: string, turnstileToken?: string | null) => {
    try {
      await authLogin({ email, password, security_token: turnstileToken || "" });
      const profile = await resolveSession();
      if (!profile) return { success: false, message: "Could not load account profile." };
      return { success: true, message: "" };
    } catch (error: any) {
      const message =
        error instanceof ApiHttpError
          ? error.body?.message || "Invalid credentials"
          : "Server connection failed";
      return { success: false, message };
    }
  }, [resolveSession]);

  const register = useCallback(async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    consent_terms_accepted: boolean;
    consent_email_sms_opt_in: boolean;
    security_token?: string | null;
  }) => {
    try {
      await authRegister({
        first_name: payload.name,
        email: payload.email,
        telephone: payload.phone || "",
        password: payload.password,
        consent_terms_accepted: payload.consent_terms_accepted,
        consent_email_sms_opt_in: payload.consent_email_sms_opt_in,
        security_token: payload.security_token || "",
      });
      return {
        success: true,
        message: "Account created successfully. Please verify your email before checkout.",
      };
    } catch (error: any) {
      const message =
        error instanceof ApiHttpError
          ? error.body?.message || "Could not create account"
          : "Server connection failed";
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // noop
    }
    setUser(null);
  }, []);

  const resendEmailVerification = useCallback(async () => {
    try {
      await authSendEmailVerification();
      return { success: true, message: "Verification email has been sent." };
    } catch (error: any) {
      const message =
        error instanceof ApiHttpError
          ? error.body?.message || "Could not send verification email"
          : "Server connection failed";
      return { success: false, message };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      resendEmailVerification,
      refreshSession: resolveSession,
    }),
    [user, isLoading, login, register, logout, resendEmailVerification, resolveSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
