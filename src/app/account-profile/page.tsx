"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

type ProvenceOption = {
  id: string;
  name_ar: string;
  name_en?: string | null;
};

export default function AccountProfilePage() {
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth();
  const [provences, setProvences] = useState<ProvenceOption[]>([]);
  const [provence, setProvence] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProvence(user.provence || "");
    setCity(user.city || "");
    setAddressLine(user.addressLine || "");
    setAddressComplement(user.addressComplement || "");
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/locations/provences?country_id=country-iq", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body) => setProvences(Array.isArray(body?.data) ? body.data : []))
      .catch(() => {
        if (!controller.signal.aborted) setProvences([]);
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!provence.trim()) {
      setError("اختر المحافظة.");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({
      provence: provence.trim(),
      city: city.trim(),
      address_line: addressLine.trim(),
      address_complement: addressComplement.trim(),
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    setSuccess(result.message);
  };

  if (isLoading) return <p className="muted">جاري تحميل معلومات الحساب...</p>;

  if (!isAuthenticated || !user) {
    return (
      <section className="card account-profile-form">
        <p className="error">يجب تسجيل الدخول لتعديل العنوان.</p>
        <Link href="/account" className="button primary">تسجيل الدخول</Link>
      </section>
    );
  }

  return (
    <div className="account-page">
      <section className="account-profile-form">
        <div className="account-profile-form-header">
          <div>
            <h1 className="page-title">تعديل العنوان</h1>
            <p className="muted">{user.email}</p>
          </div>
          <Link href="/account" className="button secondary">رجوع</Link>
        </div>

        <form onSubmit={handleSubmit} className="account-address-form">
          <label className="account-address-field">
            <span>المحافظة</span>
            <select className="input" value={provence} onChange={(event) => setProvence(event.target.value)}>
              <option value="">اختر المحافظة</option>
              {provence && !provences.some((item) => item.name_ar === provence) ? (
                <option value={provence}>{provence}</option>
              ) : null}
              {provences.map((item) => <option key={item.id} value={item.name_ar}>{item.name_ar}</option>)}
            </select>
          </label>

          <label className="account-address-field">
            <span>المدينة</span>
            <input className="input" value={city} onChange={(event) => setCity(event.target.value)} />
          </label>

          <label className="account-address-field account-address-wide">
            <span>العنوان</span>
            <textarea className="textarea" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} rows={3} />
          </label>

          <label className="account-address-field account-address-wide">
            <span>أقرب نقطة دالة</span>
            <input className="input" value={addressComplement} onChange={(event) => setAddressComplement(event.target.value)} />
          </label>

          {error ? <p className="error account-address-wide">{error}</p> : null}
          {success ? <p className="account-profile-success account-address-wide">{success}</p> : null}

          <button type="submit" className="button primary account-address-wide" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ العنوان"}
          </button>
        </form>
      </section>
    </div>
  );
}
