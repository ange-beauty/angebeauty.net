"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/formatPrice";
import { fetchMyOrders, type ClientOrder } from "@/lib/orders";

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  cancelled: "ملغى",
  completed: "مكتمل",
};

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-IQ", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function OrderCard({ order }: { order: ClientOrder }) {
  const visibleItems = order.items.slice(0, 3);

  return (
    <article className="client-order-card">
      <div className="client-order-heading">
        <span className={`client-order-status status-${order.status}`}>
          {statusLabels[order.status] || order.status}
        </span>
        <div className="client-order-identity">
          <strong>{order.id}</strong>
          <time>{formatDate(order.createdAt)}</time>
        </div>
      </div>

      <div className="client-order-items">
        {visibleItems.map((item, index) => (
          <div className="client-order-item" key={`${item.productId}-${index}`}>
            <span>x{item.quantity}</span>
            <p>{item.productName || item.productId || "منتج"}</p>
          </div>
        ))}
        {order.items.length > visibleItems.length ? (
          <p className="client-order-more">+{order.items.length - visibleItems.length} منتج</p>
        ) : null}
      </div>

      <div className="client-order-footer">
        <strong>{formatPrice(order.totalPrice)} د.ع</strong>
        <span>{order.totalItems} منتج</span>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setOrders([]);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError("");
    fetchMyOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch(() => {
        if (active) setError("تعذر تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, isAuthLoading, user?.id]);

  return (
    <div className="client-orders-page">
      <header className="client-orders-title-row">
        <h1>طلباتي</h1>
      </header>

      {isAuthLoading || isLoading ? (
        <section className="client-orders-state"><p>جار تحميل الطلبات...</p></section>
      ) : !isAuthenticated ? (
        <section className="client-orders-state"><h2>سجل الدخول لعرض طلباتك</h2></section>
      ) : error ? (
        <section className="client-orders-state client-orders-error"><p>{error}</p></section>
      ) : orders.length === 0 ? (
        <section className="client-orders-state">
          <h2>لا توجد طلبات بعد</h2>
          <p>ستظهر طلباتك هنا بعد إرسالها.</p>
        </section>
      ) : (
        <section className="client-orders-list">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      )}
    </div>
  );
}
