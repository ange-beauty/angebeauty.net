"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

type VerificationState = "idle" | "loading" | "success" | "error";

function localizeVerificationMessage(message?: string | null, fallback?: string): string {
  const normalized = (message || "").trim().toLowerCase();

  if (!normalized) {
    return fallback || "";
  }

  if (normalized === "email verified successfully." || normalized === "email verified successfully") {
    return "تم التحقق من البريد الإلكتروني بنجاح.";
  }

  if (normalized === "verification token is missing." || normalized === "verification token is missing") {
    return "رمز التحقق غير موجود.";
  }

  if (normalized === "could not verify email." || normalized === "could not verify email") {
    return "تعذر التحقق من البريد الإلكتروني.";
  }

  return message || fallback || "";
}

export default function VerifyEmailPage() {
  const { refreshSession } = useAuth();
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : "";
  const [state, setState] = useState<VerificationState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function runVerification() {
      const tokenValue = token.trim();
      if (!tokenValue) {
        if (!cancelled) {
          setState("error");
          setMessage(localizeVerificationMessage("Verification token is missing.", "رمز التحقق غير موجود."));
        }
        return;
      }

      if (!cancelled) {
        setState("loading");
        setMessage("");
      }

      try {
        const result = await verifyEmailToken(tokenValue);
        await refreshSession();
        if (cancelled) return;
        setState("success");
        setMessage(localizeVerificationMessage(result?.message, "تم التحقق من البريد الإلكتروني بنجاح."));
      } catch (error: any) {
        if (cancelled) return;
        setState("error");
        setMessage(
          localizeVerificationMessage(
            error?.body?.message || error?.message,
            "تعذر التحقق من البريد الإلكتروني.",
          ),
        );
      }
    }

    runVerification();
    return () => {
      cancelled = true;
    };
  }, [token, refreshSession]);

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h1 className="page-title">التحقق من البريد الإلكتروني</h1>
      {state === "loading" ? <p className="muted">جار التحقق...</p> : null}
      {state === "success" ? <p style={{ color: "#2f7c2f", margin: 0 }}>{message}</p> : null}
      {state === "error" ? <p className="error">{message}</p> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/account" className="button primary" style={{ display: "inline-flex", alignItems: "center" }}>
          حسابي
        </Link>
        <Link href="/home" className="button secondary" style={{ display: "inline-flex", alignItems: "center" }}>
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
