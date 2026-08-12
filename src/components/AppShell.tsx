"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBasket } from "@/contexts/BasketContext";
import {
  BellIcon,
  GridIcon,
  HomeIcon,
  PackageIcon,
  SearchIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/Icons";

const tabs = [
  { href: "/home", label: "اكتشف", icon: <HomeIcon size={29} /> },
  { href: "/products", label: "المنتجات", icon: <PackageIcon size={28} /> },
  { href: "/categories", label: "تصنيفات", icon: <GridIcon size={28} /> },
  { href: "/basket", label: "السلة", icon: <ShoppingBagIcon size={28} strokeWidth={1.9} /> },
  { href: "/brands", label: "برانداتنا", icon: <TagIcon size={28} strokeWidth={1.9} /> },
  { href: "/contact", label: "تواصل", icon: <WhatsAppIcon size={27} /> },
  { href: "/account", label: "حسابي", icon: <UserIcon size={29} strokeWidth={1.9} /> },
];

const standalonePaths = ["/turnstile-widget"];
const noHeaderPaths = ["/basket", "/brands", "/categories", "/products", "/product", "/account", "/account-register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useBasket();
  const [search, setSearch] = useState("");

  if (standalonePaths.includes(pathname)) {
    return <>{children}</>;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/products?keyword=${encodeURIComponent(query)}&focusSearch=1` : "/products?focusSearch=1");
  }

  const showHeader = !noHeaderPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <div className="app-shell">
      {showHeader ? (
        <header className={`app-header ${!isAuthenticated ? "app-header-no-bell" : ""}`}>
          {isAuthenticated ? (
            <Link href="/account" className="header-round-btn" aria-label="الإشعارات">
              <BellIcon size={22} />
            </Link>
          ) : null}
          <form className="header-search" onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن المنتجات..."
              aria-label="البحث عن المنتجات"
            />
            <SearchIcon size={22} color="#c44838" />
          </form>
        </header>
      ) : null}
      <main className="app-main">{children}</main>
      <nav className="tab-nav">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/products" && (pathname.startsWith("/product/") || pathname.startsWith("/products/")));
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
