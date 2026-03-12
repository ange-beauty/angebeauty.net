"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedCommunicationConsent, setAcceptedCommunicationConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const handleRegister = async () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "الاسم الكامل مطلوب";
    if (!email.trim()) errors.email = "البريد الإلكتروني مطلوب";
    if (!phone.trim()) errors.phone = "رقم الهاتف مطلوب";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) errors.email = "أدخل بريد إلكتروني صحيح";
    if (!password.trim()) errors.password = "كلمة المرور مطلوبة";
    else if (password.trim().length < 6) errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (!confirmPassword.trim()) errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    else if (password !== confirmPassword) errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    if (!acceptedTerms) errors.acceptedTerms = "يجب الموافقة على الشروط";
    if (!acceptedCommunicationConsent) errors.acceptedCommunicationConsent = "يجب الموافقة على رسائل التحقق";
    if (!turnstileToken) errors.turnstile = "أكمل التحقق أولاً";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const result = await register({
      name,
      email,
      password,
      phone,
      consent_terms_accepted: acceptedTerms,
      consent_email_sms_opt_in: acceptedCommunicationConsent,
      security_token: turnstileToken,
    });

    setIsSubmitting(false);
    setTurnstileToken(null);
    setTurnstileResetKey((prev) => prev + 1);

    if (!result.success) {
      setFieldErrors({ email: result.message });
      return;
    }

    if (result.message) {
      window.alert(result.message);
    }
    router.replace("/account");
  };

  return (
    <section className="card register-page-card">
      <h1 className="page-title">إنشاء حساب جديد</h1>

      <input className="input register-input" placeholder="الاسم الكامل" value={name} onChange={(event) => setName(event.target.value)} />
      {fieldErrors.name ? <p className="error">{fieldErrors.name}</p> : null}

      <input className="input register-input" placeholder="البريد الإلكتروني" value={email} onChange={(event) => setEmail(event.target.value)} />
      {fieldErrors.email ? <p className="error">{fieldErrors.email}</p> : null}

      <input className="input register-input" placeholder="رقم الهاتف" value={phone} onChange={(event) => setPhone(event.target.value)} />
      {fieldErrors.phone ? <p className="error">{fieldErrors.phone}</p> : null}

      <input className="input register-input" placeholder="كلمة المرور" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      {fieldErrors.password ? <p className="error">{fieldErrors.password}</p> : null}

      <input className="input register-input" placeholder="تأكيد كلمة المرور" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      {fieldErrors.confirmPassword ? <p className="error">{fieldErrors.confirmPassword}</p> : null}

      <label className="register-consent-row">
        <span>أوافق على شروط وأحكام الاستخدام</span>
        <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
      </label>
      {fieldErrors.acceptedTerms ? <p className="error">{fieldErrors.acceptedTerms}</p> : null}

      <label className="register-consent-row">
        <span>أوافق على التواصل عبر البريد الإلكتروني والرسائل النصية لأغراض التحقق من الحساب وتأكيد الطلبات والامتثال</span>
        <input type="checkbox" checked={acceptedCommunicationConsent} onChange={(event) => setAcceptedCommunicationConsent(event.target.checked)} />
      </label>
      {fieldErrors.acceptedCommunicationConsent ? <p className="error">{fieldErrors.acceptedCommunicationConsent}</p> : null}

      <div className="register-turnstile-wrap">
        <TurnstileWidget
          action="register"
          resetKey={turnstileResetKey}
          onTokenChange={(token) => {
            setTurnstileToken(token);
            if (token && fieldErrors.turnstile) {
              setFieldErrors((prev) => ({ ...prev, turnstile: "" }));
            }
          }}
        />
      </div>
      {fieldErrors.turnstile ? <p className="error">{fieldErrors.turnstile}</p> : null}

      <button className="register-submit-btn" onClick={handleRegister} disabled={isSubmitting}>
        {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
      </button>
    </section>
  );
}
