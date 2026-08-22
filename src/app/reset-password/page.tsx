"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const token = typeof window === "undefined"
    ? ""
    : new URLSearchParams(window.location.search).get("token")?.trim() || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {completed ? (
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
            <button className="button primary" type="submit" disabled={isSubmitting || !token}>
              {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
            {!token ? <Link href="/forgot-password">طلب رابط جديد</Link> : null}
          </form>
        )}
      </section>
    </div>
  );
}
