import { permanentRedirect } from "next/navigation";

// The storefront home lives at /home (all internal links point there). A permanent (308) redirect
// consolidates ranking signals from "/" onto /home, which declares itself canonical.
export default function IndexPage() {
  permanentRedirect("/home");
}
