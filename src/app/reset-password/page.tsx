"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { resetPassword, validatePasswordResetToken } from "@/lib/auth";

type TokenState = "checking" | "valid" | "invalid" | "error";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tokenValue = new URLSearchParams(window.location.search).get("token")?.trim() || "";
    setToken(tokenValue);

    if (!tokenValue) {
      setTokenState("invalid");
      return;
    }

    validatePasswordResetToken(tokenValue)
      .then((result) => {
        if (!cancelled) {
          setTokenState(result?.data === true ? "valid" : "invalid");
        }
      })
      .catch(() => {
        if (!cancelled) setTokenState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("رابط استعادة كلمة المرور غير صالح أو ناقص.");
      return;
    }
    if (password.length < 8) {
      setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirmation) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setCompleted(true);
    } catch (requestError: any) {
      setError(
        requestError?.status === 401
          ? "انتهت صلاحية الرابط أو أنه غير صالح. اطلب رابطاً جديداً."
          : requestError?.body?.message || "تعذر تحديث كلمة المرور حالياً.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="account-page">
      <section className="card account-login-card account-login-centered">
        <img src="/icon.png" alt="أنج بيوتي" className="account-login-logo" />
        <h1 className="page-title">تعيين كلمة مرور جديدة</h1>

        {tokenState === "checking" ? (
          <p className="muted">جاري التحقق من الرابط...</p>
        ) : tokenState === "error" ? (
          <>
            <p className="error" style={{ textAlign: "center" }}>
              تعذر التحقق من الرابط حالياً. حاول مرة أخرى.
            </p>
            <button className="button secondary" type="button" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </button>
          </>
        ) : tokenState === "invalid" ? (
          <>
            <p className="error" style={{ textAlign: "center" }}>
              رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية.
            </p>
            <Link href="/forgot-password" className="button primary">
              طلب رابط جديد
            </Link>
            <Link href="/account" className="button secondary">
              العودة إلى تسجيل الدخول
            </Link>
          </>
        ) : completed ? (
          <>
            <p style={{ color: "#2f7c2f", textAlign: "center" }}>
              تم تحديث كلمة المرور بنجاح.
            </p>
            <Link href="/account" className="button primary">
              تسجيل الدخول
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, width: "100%" }}>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="تأكيد كلمة المرور"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
            {error ? <p className="error">{error}</p> : null}
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
