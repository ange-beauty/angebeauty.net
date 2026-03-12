import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="card" style={{ display: "grid", gap: 10 }}>
      <h1 className="page-title">Contact Us</h1>
      <a className="button secondary" href="tel:+212638624446">Call: +212638624446</a>
      <a className="button secondary" href="https://wa.me/212638624446" target="_blank" rel="noreferrer">WhatsApp</a>
      <a className="button secondary" href="mailto:support@angebeauty.net">support@angebeauty.net</a>
      <Link href="/home" className="button primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        Back to Home
      </Link>
    </div>
  );
}
