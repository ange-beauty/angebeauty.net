"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import { useBasket } from "@/contexts/BasketContext";
import { useSellingPoint } from "@/contexts/SellingPointContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProductById } from "@/lib/api";
import { withClientSourceHeader } from "@/lib/requestHeaders";
import { formatPrice } from "@/lib/formatPrice";
import { getAvailableQuantityForSellingPoint } from "@/lib/availability";
import TurnstileWidget from "@/components/TurnstileWidget";

type CheckoutMode = "closed" | "guest" | "auth";

export default function BasketPage() {
  const { basket, updateQuantity, removeFromBasket, clearBasket } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();
  const { isAuthenticated, user } = useAuth();
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("closed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [provence, setProvence] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setTelephone(user?.phone || "");
    setProvence(user?.provence || "");
    setCity(user?.city || "");
    setAddressLine(user?.addressLine || "");
    setAddressComplement(user?.addressComplement || "");
  }, [user]);

  const productQueries = useQueries({
    queries: basket.map((item) => ({
      queryKey: ["basket-product", item.productId],
      queryFn: () => fetchProductById(item.productId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const products = basket
    .map((item, idx) => {
      const product = productQueries[idx]?.data;
      if (!product) return null;
      return { ...product, quantity: item.quantity };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);

  const totalPrice = useMemo(
    () => products.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [products],
  );

  const orderMutation = useMutation({
    mutationFn: async ({ orderData, idempotencyKey }: { orderData: any; idempotencyKey: string }) => {
      const response = await fetch(`/api/v1/selling-orders/client-initialization`, {
        method: "POST",
        headers: withClientSourceHeader({
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        }),
        body: JSON.stringify(orderData),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "فشل إرسال الطلب.");
      if (body?.status !== "success" && body?.success !== true) throw new Error(body?.message || "تم رفض الطلب.");
      return body;
    },
    onSuccess: () => {
      window.alert("تم إرسال الطلب بنجاح.");
      clearBasket();
      setProvence("");
      setCity("");
      setAddressLine("");
      setAddressComplement("");
      setErrors({});
      setCheckoutMode("closed");
      setTurnstileToken(null);
      idempotencyKeyRef.current = null;
    },
    onError: (error: any) => {
      window.alert(error?.message || "حدث خطأ غير متوقع أثناء إرسال الطلب.");
      if (checkoutMode === "guest") {
        setTurnstileToken(null);
        setTurnstileResetKey((previous) => previous + 1);
      }
    },
  });

  function openCheckout(mode: CheckoutMode) {
    if (mode === "guest") {
      setName("");
      setEmail("");
      setTelephone("");
      setProvence("");
      setCity("");
      setAddressLine("");
      setAddressComplement("");
    } else {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setTelephone(user?.phone || "");
      setProvence(user?.provence || "");
      setCity(user?.city || "");
      setAddressLine(user?.addressLine || "");
      setAddressComplement(user?.addressComplement || "");
    }
    setErrors({});
    setTurnstileToken(null);
    setTurnstileResetKey((previous) => previous + 1);
    idempotencyKeyRef.current = crypto.randomUUID();
    setCheckoutMode(mode);
  }

  function closeCheckout() {
    setCheckoutMode("closed");
    setTurnstileToken(null);
    idempotencyKeyRef.current = null;
    setErrors({});
  }

  function submitOrder() {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = "الاسم الكامل مطلوب.";
    if (!telephone.trim()) nextErrors.telephone = "رقم الهاتف مطلوب.";
    if (checkoutMode === "auth" && !email.trim()) nextErrors.email = "البريد الإلكتروني مطلوب.";
    if (!provence.trim()) nextErrors.provence = "المحافظة مطلوبة.";
    if (!city.trim()) nextErrors.city = "المدينة مطلوبة.";
    if (!addressLine.trim()) nextErrors.addressLine = "العنوان مطلوب.";
    if (!addressComplement.trim()) nextErrors.addressComplement = "أقرب نقطة دالة مطلوبة.";
    if (!selectedSellingPoint?.id) nextErrors.sellingPoint = "يرجى اختيار نقطة البيع أولاً.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (checkoutMode === "auth" && email.trim() && !emailRegex.test(email.trim())) {
      nextErrors.email = "يرجى إدخال بريد إلكتروني صحيح.";
    }

    const unavailableItem = products.find((product) => {
      const available = getAvailableQuantityForSellingPoint(product, selectedSellingPoint?.id);
      return available !== null && product.quantity > available;
    });

    if (unavailableItem) {
      nextErrors.availability = `الكمية غير متوفرة للمنتج: ${unavailableItem.name}`;
    }

    if (checkoutMode === "auth" && (!isAuthenticated || !user?.emailVerified)) {
      nextErrors.auth = "يرجى تسجيل الدخول وتفعيل البريد الإلكتروني أو استخدام الطلب كزائر.";
    }
    if (checkoutMode === "guest" && !turnstileToken) {
      nextErrors.turnstile = "أكمل التحقق أولاً.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    idempotencyKeyRef.current ||= crypto.randomUUID();
    const combinedAddress = [provence, city, addressLine, addressComplement]
      .map((value) => value.trim())
      .filter(Boolean)
      .join("، ");
    orderMutation.mutate({
      idempotencyKey: idempotencyKeyRef.current,
      orderData: {
        selling_point: selectedSellingPoint?.id,
        customer: {
          name: name.trim(),
          ...(checkoutMode === "auth" ? { email: email.trim() } : {}),
          telephone: telephone.trim(),
          provence: provence.trim(),
          city: city.trim(),
          address_line: addressLine.trim(),
          address_complement: addressComplement.trim(),
          address: combinedAddress,
        },
        items: products.map((item) => ({
          productId: item.id,
          productName: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        summary: {
          totalItems: products.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice,
        },
        security_token: checkoutMode === "guest" ? turnstileToken : undefined,
      },
    });
  }

  return (
    <div className="basket-page">
      <section className="basket-header">
        <div>
          <h1 className="page-title basket-title">السلة</h1>
          <p className="basket-subtitle">{products.length ? `${products.length} منتج` : "0 منتج"}</p>
        </div>
        {products.length ? (
          <button type="button" className="basket-clear-inline" onClick={clearBasket}>
            <TrashIcon size={15} color="#ef4444" />
            إفراغ السلة
          </button>
        ) : null}
      </section>

      {products.length === 0 ? (
        <section className="card basket-empty-card">
          <p className="basket-empty-title">سلتك فارغة</p>
          <p className="muted">ابدأ بإضافة المنتجات إلى السلة.</p>
        </section>
      ) : (
        <section className="basket-items">
          {products.map((item) => (
            <article key={item.id} className="basket-row">
              <div className="basket-row-meta">
                <div className="basket-row-price-wrap">
                  <p className="basket-row-price">{formatPrice(item.price * item.quantity)}</p>
                  <p className="basket-row-unit-price">{formatPrice(item.price)}</p>
                  <button
                    type="button"
                    className="basket-icon-danger"
                    aria-label="حذف المنتج"
                    onClick={() => removeFromBasket(item.id)}
                  >
                    <TrashIcon size={16} color="#ef4444" />
                  </button>
                </div>

                <div className="basket-row-main">
                  <div className="basket-row-copy">
                    <p className="basket-row-brand">{item.brand}</p>
                    <p className="basket-row-name">{item.name}</p>
                  </div>

                  <div className="basket-row-actions">
                    <div className="basket-qty-control">
                      <button
                        type="button"
                        className="basket-qty-btn"
                        aria-label="زيادة الكمية"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <PlusIcon size={15} color="#2d2327" />
                      </button>
                      <span className="basket-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="basket-qty-btn"
                        aria-label="تقليل الكمية"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <MinusIcon size={15} color="#2d2327" />
                      </button>
                    </div>

                    <img
                      src={item.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=180&h=180&fit=crop"}
                      alt={item.name}
                      className="basket-row-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {products.length > 0 ? (
        <section className="basket-summary-bar">
          <div className="basket-summary-actions">
            {!isAuthenticated ? (
              <>
                <Link href="/account" className="button secondary basket-summary-btn">
                  تسجيل الدخول
                </Link>
                <button type="button" className="button primary basket-summary-btn basket-summary-btn-dark" onClick={() => openCheckout("guest")}>
                  إرسال الطلب كزائر
                </button>
              </>
            ) : (
              <button type="button" className="button primary basket-summary-btn basket-summary-btn-dark basket-summary-btn-full" onClick={() => openCheckout("auth")}>
                إتمام الطلب
              </button>
            )}
          </div>

          {!isAuthenticated ? (
            <p className="basket-summary-note">يرجى تسجيل الدخول لتجربة أفضل، أو أرسل الطلب كزائر.</p>
          ) : !user?.emailVerified ? (
            <p className="basket-summary-note">يرجى تفعيل البريد الإلكتروني أو استخدم الطلب كزائر.</p>
          ) : null}

          <div className="basket-summary-total">
            <span className="basket-summary-total-label">المجموع</span>
            <strong className="basket-summary-total-value">{formatPrice(totalPrice)}</strong>
          </div>
        </section>
      ) : null}

      {checkoutMode !== "closed" ? (
        <div className="basket-checkout-overlay" onClick={closeCheckout}>
          <section className="basket-checkout-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="basket-checkout-header">
              <h2>إتمام الطلب</h2>
              <button
                type="button"
                className="basket-checkout-close"
                aria-label="إغلاق"
                onClick={closeCheckout}
              >
                <CloseIcon size={18} color="#1f1719" />
              </button>
            </header>

            <div className="basket-checkout-body">
              <div className="basket-checkout-total-box">
                <span className="basket-checkout-total-label">المجموع الكلي</span>
                <strong className="basket-checkout-total-value">{formatPrice(totalPrice)}</strong>
              </div>

              <label className="basket-field">
                <span>الاسم الكامل *</span>
                <input className="input" placeholder="أدخل اسمك" value={name} onChange={(event) => setName(event.target.value)} />
                {errors.name ? <p className="error">{errors.name}</p> : null}
              </label>

              <label className="basket-field">
                <span>رقم الهاتف *</span>
                <input className="input" placeholder="أدخل رقم الهاتف" value={telephone} onChange={(event) => setTelephone(event.target.value)} />
                {errors.telephone ? <p className="error">{errors.telephone}</p> : null}
              </label>

              {checkoutMode === "auth" ? (
                <label className="basket-field">
                  <span>البريد الإلكتروني *</span>
                  <input className="input" placeholder="أدخل بريدك الإلكتروني" value={email} onChange={(event) => setEmail(event.target.value)} />
                  {errors.email ? <p className="error">{errors.email}</p> : null}
                </label>
              ) : null}

              <label className="basket-field">
                <span>نقطة البيع *</span>
                <input
                  className="input"
                  value={selectedSellingPoint?.name_ar || selectedSellingPoint?.name_en || ""}
                  readOnly
                  placeholder="اختر نقطة البيع من صفحة المتجر"
                />
                {errors.sellingPoint ? <p className="error">{errors.sellingPoint}</p> : null}
              </label>

              <label className="basket-field">
                <span>المحافظة *</span>
                <input className="input" placeholder="أدخلي المحافظة" value={provence} onChange={(event) => setProvence(event.target.value)} />
                {errors.provence ? <p className="error">{errors.provence}</p> : null}
              </label>

              <label className="basket-field">
                <span>المدينة *</span>
                <input className="input" placeholder="أدخلي المدينة" value={city} onChange={(event) => setCity(event.target.value)} />
                {errors.city ? <p className="error">{errors.city}</p> : null}
              </label>

              <label className="basket-field">
                <span>العنوان *</span>
                <textarea className="textarea basket-address-input" placeholder="أدخلي العنوان" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
                {errors.addressLine ? <p className="error">{errors.addressLine}</p> : null}
              </label>

              <label className="basket-field">
                <span>أقرب نقطة دالة *</span>
                <input className="input" placeholder="مثال: قرب المدرسة أو السوق" value={addressComplement} onChange={(event) => setAddressComplement(event.target.value)} />
                {errors.addressComplement ? <p className="error">{errors.addressComplement}</p> : null}
              </label>

              {errors.auth ? <p className="error">{errors.auth}</p> : null}
              {errors.availability ? <p className="error">{errors.availability}</p> : null}

              {checkoutMode === "guest" ? (
                <div className="basket-turnstile-wrap">
                  <TurnstileWidget
                    action="checkout"
                    resetKey={turnstileResetKey}
                    onTokenChange={(token) => {
                      setTurnstileToken(token);
                      if (token && errors.turnstile) {
                        setErrors((previous) => ({ ...previous, turnstile: "" }));
                      }
                    }}
                  />
                  {errors.turnstile ? <p className="error">{errors.turnstile}</p> : null}
                </div>
              ) : null}

              <button
                type="button"
                className="button primary basket-confirm-button"
                onClick={submitOrder}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "جار تأكيد الطلب..." : "تأكيد الطلب"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
