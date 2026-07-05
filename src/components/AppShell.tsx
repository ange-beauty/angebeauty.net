"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBasket } from "@/contexts/BasketContext";
import { GridIcon, HomeIcon, PinIcon, ShoppingBagIcon, UserIcon, WhatsAppIcon } from "@/components/Icons";

const tabs = [
  { href: "/home", label: "اكتشف", icon: <HomeIcon size={29} /> },
  { href: "/products", label: "المنتجات", icon: <GridIcon size={28} /> },
  { href: "/basket", label: "السلة", icon: <ShoppingBagIcon size={28} strokeWidth={1.9} /> },
  { href: "/store", label: "المتجر", icon: <PinIcon size={29} strokeWidth={1.9} /> },
  { href: "/account", label: "حسابي", icon: <UserIcon size={29} strokeWidth={1.9} /> },
];

const standalonePaths = ["/turnstile-widget"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems } = useBasket();

  if (standalonePaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/home" className="brand">
          <img src="/icon.png" alt="" className="brand-icon" />
          <span>أنج بيوتي</span>
        </Link>
        <nav className="top-links">
          <a href="https://wa.me/96477061791777" target="_blank" rel="noreferrer" aria-label="تواصل معنا على واتساب">
            <WhatsAppIcon size={30} />
          </a>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <nav className="tab-nav">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href === "/products" && pathname.startsWith("/product/"));
          return (
            <Link key={tab.href} href={tab.href} className={isActive ? "tab-link active" : "tab-link"}>
              <span className="tab-icon-wrap">
                {tab.icon ? <span className="tab-icon">{tab.icon}</span> : null}
                {tab.href === "/basket" && totalItems > 0 ? <span className="badge">{totalItems > 99 ? "99+" : totalItems}</span> : null}
              </span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
