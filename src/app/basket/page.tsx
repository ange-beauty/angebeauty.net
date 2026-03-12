"use client";

import { useEffect, useMemo, useState } from "react";
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

type CheckoutMode = "closed" | "guest" | "auth";

export default function BasketPage() {
  const { basket, updateQuantity, removeFromBasket, clearBasket } = useBasket();
  const { selectedSellingPoint } = useSellingPoint();
  const { isAuthenticated, user } = useAuth();
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("closed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setTelephone(user?.phone || "");
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
    mutationFn: async (orderData: any) => {
      const response = await fetch(`/api/v1/selling-orders/client-initialization`, {
        method: "POST",
        headers: withClientSourceHeader({
          Accept: "application/json",
          "Content-Type": "application/json",
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
      setAddress("");
      setErrors({});
      setCheckoutMode("closed");
    },
    onError: (error: any) => {
      window.alert(error?.message || "حدث خطأ غير متوقع أثناء إرسال الطلب.");
    },
  });

  function openCheckout(mode: CheckoutMode) {
    setErrors({});
    setCheckoutMode(mode);
  }

  function submitOrder() {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = "الاسم الكامل مطلوب.";
    if (!telephone.trim()) nextErrors.telephone = "رقم الهاتف مطلوب.";
    if (!email.trim()) nextErrors.email = "البريد الإلكتروني مطلوب.";
    if (!address.trim()) nextErrors.address = "العنوان مطلوب.";
    if (!selectedSellingPoint?.id) nextErrors.sellingPoint = "يرجى اختيار نقطة البيع أولاً.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
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

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    orderMutation.mutate({
      client_name: name.trim(),
      client_email: email.trim(),
      client_phone: telephone.trim(),
      client_address: address.trim(),
      selling_point: selectedSellingPoint?.id,
      basket_items: products.map((item) => ({ product: item.id, quantity: item.quantity })),
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
        <div className="basket-checkout-overlay" onClick={() => setCheckoutMode("closed")}>
          <section className="basket-checkout-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="basket-checkout-header">
              <h2>إتمام الطلب</h2>
              <button
                type="button"
                className="basket-checkout-close"
                aria-label="إغلاق"
                onClick={() => setCheckoutMode("closed")}
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

              <label className="basket-field">
                <span>البريد الإلكتروني *</span>
                <input className="input" placeholder="أدخل بريدك الإلكتروني" value={email} onChange={(event) => setEmail(event.target.value)} />
                {errors.email ? <p className="error">{errors.email}</p> : null}
              </label>

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
                <span>العنوان *</span>
                <textarea className="textarea basket-address-input" placeholder="أدخل عنوانك الكامل" value={address} onChange={(event) => setAddress(event.target.value)} />
                {errors.address ? <p className="error">{errors.address}</p> : null}
              </label>

              {errors.auth ? <p className="error">{errors.auth}</p> : null}
              {errors.availability ? <p className="error">{errors.availability}</p> : null}

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
