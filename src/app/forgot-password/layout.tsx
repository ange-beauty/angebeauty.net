import type { Metadata } from "next";

// Private/utility page: keep it out of search results but let crawlers follow its links.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
