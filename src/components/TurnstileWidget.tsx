"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Props = {
  action: "login" | "register";
  resetKey?: number;
  onTokenChange: (token: string | null) => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SCRIPT_ID = "cf-turnstile-script";

declare global {
  interface Window {
    turnstile?: {
      render?: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

function ensureTurnstileScript(onLoad: () => void) {
  if (window.turnstile && typeof window.turnstile.render === "function") {
    onLoad();
    return;
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    existing.addEventListener("load", onLoad, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onLoad, { once: true });
  document.head.appendChild(script);
}

export default function TurnstileWidget({ action, resetKey = 0, onTokenChange }: Props) {
  const callbackRef = useRef(onTokenChange);
  const widgetIdRef = useRef<string | null>(null);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const containerId = useMemo(() => `cf-turnstile-${action}-${resetKey}`, [action, resetKey]);

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    callbackRef.current(null);

    if (!SITE_KEY) {
      return;
    }

    let cancelled = false;

    const render = () => {
      if (cancelled) {
        return;
      }

      if (!window.turnstile || typeof window.turnstile.render !== "function") {
        window.setTimeout(render, 120);
        return;
      }

      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: SITE_KEY,
        action,
        callback: (token: string) => {
          setWidgetError(null);
          callbackRef.current(token || null);
        },
        "expired-callback": () => callbackRef.current(null),
        "error-callback": () => {
          setWidgetError("turnstile_error");
          callbackRef.current(null);
        },
      });
    };

    ensureTurnstileScript(render);

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // no-op
        }
      }
      widgetIdRef.current = null;
    };
  }, [action, containerId, resetKey]);

  if (!SITE_KEY) {
    return (
      <div style={styles.missingKeyBox}>
        <p style={styles.missingKeyText}>تعذر تحميل التحقق. يرجى إضافة NEXT_PUBLIC_TURNSTILE_SITE_KEY</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div id={containerId} style={{ minHeight: 65, width: "100%" }} />
      {widgetError ? <p style={styles.widgetErrorText}>خطأ في التحقق: {widgetError}</p> : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: 78,
    borderRadius: 12,
    border: "1px solid #E2E8DD",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    padding: 6,
  },
  widgetErrorText: {
    margin: 0,
    padding: "4px 8px 2px",
    fontSize: 11,
    color: "#B9442B",
    textAlign: "right",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  missingKeyBox: {
    borderRadius: 12,
    border: "1px solid #E53935",
    backgroundColor: "#FFF5F5",
    padding: "8px 10px",
  },
  missingKeyText: {
    margin: 0,
    fontSize: 12,
    color: "#B9442B",
    textAlign: "right",
    lineHeight: "18px",
  },
};
