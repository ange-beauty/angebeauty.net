"use client";

import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { fetchProductById } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";
import { fetchMyOrders, type ClientOrder } from "@/lib/orders";

const statusLabels: Record<string, string> = {
  draft: "\u0645\u0633\u0648\u062f\u0629",
  confirmed: "\u0645\u0624\u0643\u062f",
  partially_returned: "\u0645\u0631\u062a\u062c\u0639 \u062c\u0632\u0626\u064a\u0627\u064b",
  returned: "\u0645\u0631\u062a\u062c\u0639",
  cancelled: "\u0645\u0644\u063a\u0649",
  completed: "\u0645\u0643\u062a\u0645\u0644",
};

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-IQ", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function OrderCard({ order, onClick }: { order: ClientOrder; onClick: () => void }) {
  return (
    <button type="button" className="client-order-card" onClick={onClick}>
      <div className="client-order-heading">
        <span className={`client-order-status status-${order.status}`}>
          {statusLabels[order.status] || order.status}
        </span>
        <time>{formatDate(order.createdAt)}</time>
      </div>

      <div className="client-order-footer">
        <strong>{formatPrice(order.totalPrice)} {"\u062f.\u0639"}</strong>
        <span>{"\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644"} <b aria-hidden="true">&#8249;</b></span>
      </div>
    </button>
  );
}

function OrderDetailsDialog({ order, onClose }: { order: ClientOrder | null; onClose: () => void }) {
  const productQueries = useQueries({
    queries: (order?.items || []).map((item) => ({
      queryKey: ["order-product", item.productId],
      queryFn: () => fetchProductById(item.productId),
      enabled: Boolean(item.productId && (!item.productName || !item.image)),
      staleTime: 5 * 60 * 1000,
    })),
  });

  if (!order) return null;

  return (
    <div className="client-order-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="client-order-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-order-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="client-order-dialog-header">
          <button type="button" onClick={onClose} aria-label="Close order details">&times;</button>
          <h2 id="client-order-dialog-title">{"\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0637\u0644\u0628"}</h2>
        </header>

        <div className="client-order-dialog-body">
          <div className="client-order-dialog-summary">
            <span className={`client-order-status status-${order.status}`}>
              {statusLabels[order.status] || order.status}
            </span>
            <strong dir="ltr">{order.sellingOrder || order.id}</strong>
            <time>{formatDate(order.createdAt)}</time>
          </div>

          <h3>{"\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a"}</h3>
          <div className="client-order-detail-items">
            {order.items.map((item, index) => {
              const product = productQueries[index]?.data;
              const displayName = item.productName || product?.name || "\u0645\u0646\u062a\u062c";
              const image = item.image || product?.image || "";

              return (
                <div className="client-order-detail-item" key={`${item.productId}-${index}`}>
                  <div className="client-order-detail-media">
                    {image ? <img src={image} alt={displayName} loading="lazy" decoding="async" /> : <span />}
                  </div>
                  <div className="client-order-detail-copy">
                    <p>{displayName}</p>
                    <dl className="client-order-detail-metrics">
                      <div>
                        <dt>{"\u0627\u0644\u0643\u0645\u064a\u0629"}</dt>
                        <dd>{item.quantity}</dd>
                      </div>
                      <div>
                        <dt>{"\u0633\u0639\u0631 \u0627\u0644\u0648\u062d\u062f\u0629"}</dt>
                        <dd>{formatPrice(item.price)} {"\u062f.\u0639"}</dd>
                      </div>
                      <div>
                        <dt>{"\u0627\u0644\u0645\u062c\u0645\u0648\u0639"}</dt>
                        <dd className="client-order-line-total">{formatPrice(item.price * item.quantity)} {"\u062f.\u0639"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="client-order-dialog-total">
            <strong>{formatPrice(order.totalPrice)} {"\u062f.\u0639"}</strong>
            <span>{"\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0643\u0644\u064a"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
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
        if (active) setError("\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.");
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
        <h1>{"\u0637\u0644\u0628\u0627\u062a\u064a"}</h1>
      </header>

      {isAuthLoading || isLoading ? (
        <section className="client-orders-state"><p>{"\u062c\u0627\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a..."}</p></section>
      ) : !isAuthenticated ? (
        <section className="client-orders-state"><h2>{"\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0639\u0631\u0636 \u0637\u0644\u0628\u0627\u062a\u0643"}</h2></section>
      ) : error ? (
        <section className="client-orders-state client-orders-error"><p>{error}</p></section>
      ) : orders.length === 0 ? (
        <section className="client-orders-state">
          <h2>{"\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0628\u0639\u062f"}</h2>
          <p>{"\u0633\u062a\u0638\u0647\u0631 \u0637\u0644\u0628\u0627\u062a\u0643 \u0647\u0646\u0627 \u0628\u0639\u062f \u0625\u0631\u0633\u0627\u0644\u0647\u0627."}</p>
        </section>
      ) : (
        <section className="client-orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
          ))}
        </section>
      )}
      <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
