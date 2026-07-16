"use client";

import Link from "next/link";
import { useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { ClipboardIcon, HeartIcon, UserIcon } from "@/components/Icons";
import { useAuth } from "@/contexts/AuthContext";
import { useBasket } from "@/contexts/BasketContext";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function AccountPage() {
  const { user, isLoading, isAuthenticated, login, logout, resendEmailVerification } = useAuth();
  const { totalItems } = useBasket();
  const { favorites } = useFavorites();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const handleLogin = async () => {
    const errors: Record<string, string> = {};

    if (!email.trim()) errors.email = "البريد الإلكتروني مطلوب";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) errors.email = "أدخل بريد إلكتروني صحيح";
    if (!password.trim()) errors.password = "كلمة المرور مطلوبة";
    if (!turnstileToken) errors.turnstile = "أكمل التحقق أولاً";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    const result = await login(email, password, turnstileToken);
    setTurnstileToken(null);
    setTurnstileResetKey((prev) => prev + 1);
    if (!result.success) {
      setFieldErrors({ email: result.message });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="card"><p className="muted">جاري تحميل الحساب...</p></div>;
  }

  return (
    <div className="account-page">
      {isAuthenticated && user ? (
        <>
          <section className="account-profile-card">
            <div className="account-avatar">{(user.name || "ي").trim().charAt(0)}</div>
            <h1 className="account-name">{user.name || "ضيف"}</h1>
            <div className="account-stats">
              <div className="account-stat">
                <span className="account-stat-value">{favorites.length}</span>
                <span className="account-stat-label">المفضلات</span>
              </div>
              <div className="account-stat">
                <span className="account-stat-value">{totalItems}</span>
                <span className="account-stat-label">السلة</span>
              </div>
              <div className="account-stat">
                <span className="account-stat-value">-</span>
                <span className="account-stat-label">طلباتي</span>
              </div>
            </div>
          </section>

          <section className="card account-logout-card">
            <button className="account-logout-btn" onClick={logout}>تسجيل خروج</button>
          </section>

          <section className="account-menu">
            <div className="account-menu-item">
              <span className="account-menu-leading"><UserIcon size={18} strokeWidth={1.8} /></span>
              <div className="account-menu-text">
                <p className="account-menu-title">معلوماتي الشخصية</p>
                <p className="account-menu-subtitle">{user.email || "لا يوجد بريد إلكتروني"}</p>
              </div>
              <span className="account-menu-trailing"><HeartIcon size={18} strokeWidth={1.8} /></span>
            </div>

            <Link href="/favorites" className="account-menu-item">
              <span className="account-menu-leading"><HeartIcon size={18} strokeWidth={1.8} /></span>
              <div className="account-menu-text">
                <p className="account-menu-title">المفضلات</p>
                <p className="account-menu-subtitle">مشاهدة منتجاتك المحفوظة</p>
              </div>
              <span className="account-menu-trailing"><HeartIcon size={18} strokeWidth={1.8} /></span>
            </Link>

            <Link href="/orders" className="account-menu-item">
              <span className="account-menu-leading"><ClipboardIcon size={18} strokeWidth={1.8} /></span>
              <div className="account-menu-text">
                <p className="account-menu-title">طلباتي</p>
                <p className="account-menu-subtitle">متابعة حالة الطلبات</p>
              </div>
              <span className="account-menu-trailing"><HeartIcon size={18} strokeWidth={1.8} /></span>
            </Link>
          </section>

          {!user.emailVerified ? (
            <section className="card" style={{ background: "#fff2f4", display: "grid", gap: 8 }}>
              <p className="error">البريد الإلكتروني غير موثّق.</p>
              <button
                className="button secondary"
                onClick={async () => {
                  const result = await resendEmailVerification();
                  window.alert(result.message);
                }}
              >
                إعادة إرسال رابط التوثيق
              </button>
            </section>
          ) : null}
        </>
      ) : (
        <section className="card account-login-card account-login-centered">
          <img src="/icon.png" alt="أنج بيوتي" className="account-login-logo" />
          <h1 className="page-title">أنج بيوتي</h1>
          <p className="account-login-motto">أنج بيوتي جمال ملائكي</p>

          <input className="input" placeholder="البريد الإلكتروني" value={email} onChange={(event) => setEmail(event.target.value)} />
          {fieldErrors.email ? <p className="error">{fieldErrors.email}</p> : null}

          <input className="input" placeholder="كلمة المرور" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {fieldErrors.password ? <p className="error">{fieldErrors.password}</p> : null}

          <TurnstileWidget
            action="login"
            resetKey={turnstileResetKey}
            onTokenChange={(token) => {
              setTurnstileToken(token);
              if (token && fieldErrors.turnstile) {
                setFieldErrors((prev) => ({ ...prev, turnstile: "" }));
              }
            }}
          />
          {fieldErrors.turnstile ? <p className="error">{fieldErrors.turnstile}</p> : null}

          <button className="button primary" onClick={handleLogin} disabled={isSubmitting}>
            {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <Link href="/account-register" className="button secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            إنشاء حساب جديد
          </Link>
        </section>
      )}
    </div>
  );
}
