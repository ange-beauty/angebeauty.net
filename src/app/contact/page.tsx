import type { Metadata } from "next";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";

const phone = "+9647761791777";
const phoneLabel = "+964 776 179 1777";
const email = "support@angebeauty.net";

export const metadata: Metadata = {
  title: "تواصل معنا | أنج بيوتي",
  description: "تواصل مع خدمة عملاء أنج بيوتي عبر الهاتف أو واتساب أو البريد الإلكتروني.",
};

const contactMethods = [
  {
    href: `tel:${phone}`,
    title: "اتصال هاتفي",
    value: phoneLabel,
    icon: <PhoneIcon size={23} />,
  },
  {
    href: `https://wa.me/${phone.replace("+", "")}`,
    title: "واتساب",
    value: "تحدث مع خدمة العملاء",
    icon: <WhatsAppIcon size={24} />,
    external: true,
  },
  {
    href: `mailto:${email}`,
    title: "البريد الإلكتروني",
    value: email,
    icon: <MailIcon size={23} />,
  },
];

export default function ContactPage() {
  return (
    <div className="contact-page" dir="rtl">
      <header className="contact-intro">
        <span className="contact-kicker">أنج بيوتي</span>
        <h1>تواصل معنا</h1>
        <p>اختر وسيلة التواصل المناسبة وسيساعدك فريق خدمة العملاء.</p>
      </header>

      <section className="contact-methods" aria-label="وسائل التواصل">
        {contactMethods.map((method) => (
          <a
            key={method.title}
            className="contact-method"
            href={method.href}
            target={method.external ? "_blank" : undefined}
            rel={method.external ? "noreferrer" : undefined}
          >
            <span className="contact-method-icon">{method.icon}</span>
            <span className="contact-method-copy">
              <strong>{method.title}</strong>
              <span dir={method.title === "البريد الإلكتروني" ? "ltr" : undefined}>{method.value}</span>
            </span>
            <span className="contact-method-arrow" aria-hidden="true">‹</span>
          </a>
        ))}
      </section>

      <p className="contact-note">للاستفسار عن طلب، يرجى تجهيز رقم الطلب قبل التواصل.</p>
    </div>
  );
}
