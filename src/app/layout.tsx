import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "أنج بيوتي",
  description: "أنج بيوتي جمال ملائكي",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
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
