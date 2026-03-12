import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Ange Beauty",
  description: "Ange Beauty web app migrated from Expo mobile app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
