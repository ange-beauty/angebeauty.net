"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const SCRIPT_ID = "cf-turnstile-widget-page-script";
const DEFAULT_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

declare global {
  interface Window {
    turnstile?: {
      render?: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove?: (widgetId: string) => void;
    };
    ReactNativeWebView?: {
      postMessage?: (payload: string) => void;
    };
  }
}

export default function TurnstileWidgetPage() {
  const [status, setStatus] = useState<{ message: string; ok: boolean; visible: boolean }>({
    message: "",
    ok: false,
    visible: false,
  });
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const sitekey = (params?.get("sitekey") || DEFAULT_SITE_KEY).trim();
  const action = (params?.get("action") || "login").trim();

  useEffect(() => {
    const post = (message: Record<string, unknown>) => {
      const payload = JSON.stringify(message);
      try {
        window.ReactNativeWebView?.postMessage?.(payload);
      } catch {
        // no-op
      }
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, "*");
        }
      } catch {
        // no-op
      }
    };

    const setStatusState = (message: string, ok: boolean, visible: boolean) => {
      setStatus({ message, ok, visible });
    };

    if (!sitekey) {
      setStatusState("Missing sitekey query parameter.", false, true);
      post({ type: "error", message: "missing_sitekey" });
      return;
    }

    let cancelled = false;
    let widgetId: string | null = null;

    const render = () => {
      if (cancelled) {
        return;
      }
      if (!window.turnstile || typeof window.turnstile.render !== "function") {
        window.setTimeout(render, 120);
        return;
      }

      widgetId = window.turnstile.render("#turnstile", {
        sitekey,
        action,
        appearance: "always",
        size: "normal",
        callback: (token: string) => {
          setStatusState("", true, false);
          post({ type: "token", token: token || "" });
        },
        "expired-callback": () => {
          setStatusState("Turnstile expired. Please retry.", false, true);
          post({ type: "expired" });
        },
        "error-callback": (code: string) => {
          setStatusState(`Turnstile error: ${code || "unknown_error"}`, false, true);
          post({ type: "error", message: code || "turnstile_error" });
        },
      });
    };

    const onScriptError = () => {
      setStatusState("Failed to load Turnstile API script.", false, true);
      post({ type: "error", message: "script_load_failed" });
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile && typeof window.turnstile.render === "function") {
        render();
      } else {
        existing.addEventListener("load", render, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      script.addEventListener("error", onScriptError, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // no-op
        }
      }
    };
  }, [action, sitekey]);

  return (
    <main style={styles.page}>
      <div
        style={{
          ...styles.status,
          ...(status.ok ? styles.ok : {}),
          display: status.visible ? "block" : "none",
        }}
      >
        {status.message}
      </div>
      <div style={styles.widgetWrap}>
        <div id="turnstile" className="cf-turnstile" style={{ minHeight: 65 }} />
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "72px",
    background: "transparent",
  },
  status: {
    border: "1px solid #e7c2c8",
    borderRadius: "8px",
    background: "#fff5f7",
    color: "#a33d52",
    fontSize: "12px",
    lineHeight: 1.4,
    padding: "8px 10px",
    margin: "6px",
  },
  ok: {
    borderColor: "#cde7c6",
    background: "#f5fff3",
    color: "#2f7c2f",
  },
  widgetWrap: {
    minHeight: "72px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px 4px",
  },
};
