"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("أدخل بريداً إلكترونياً صحيحاً");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await forgotPassword(value);
      setSubmitted(true);
    } catch {
      setError("تعذر إرسال الطلب حالياً. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="account-page">
      <section className="card account-login-card account-login-centered">
        <img src="/icon.png" alt="أنج بيوتي" className="account-login-logo" />
        <h1 className="page-title">استعادة كلمة المرور</h1>

        {submitted ? (
          <>
            <p style={{ textAlign: "center", lineHeight: 1.8 }}>
              إذا كان البريد مرتبطاً بحساب، أرسلنا رابطاً لإعادة تعيين كلمة المرور.
            </p>
            <Link href="/account" className="button primary">
              العودة إلى تسجيل الدخول
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, width: "100%" }}>
            <p className="muted" style={{ textAlign: "center" }}>
              أدخل البريد الإلكتروني المرتبط بحسابك.
            </p>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {error ? <p className="error">{error}</p> : null}
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
            <Link href="/account" className="button secondary">
              رجوع
            </Link>
          </form>
        )}
      </section>
    </div>
  );
}
