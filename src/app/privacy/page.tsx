import type { Metadata } from "next";

const email = "support@angebeauty.net";
const phone = "+9647761791777";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | Privacy Policy | أنج بيوتي",
  description: "سياسة خصوصية تطبيق وموقع أنج بيوتي باللغة العربية والإنجليزية.",
  alternates: {
    canonical: "https://www.angebeauty.net/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-hero">
        <p className="privacy-brand">ANGE BEAUTY | أنج بيوتي</p>
        <h1>سياسة الخصوصية <span>Privacy Policy</span></h1>
        <p>آخر تحديث: 21 أغسطس 2026 | Last updated: August 21, 2026</p>
        <nav className="privacy-language-nav" aria-label="Privacy policy languages">
          <a href="#arabic">العربية</a>
          <a href="#english">English</a>
        </nav>
      </header>

      <article id="arabic" className="privacy-document" dir="rtl" lang="ar">
        <header>
          <p className="privacy-language-label">العربية</p>
          <h2>سياسة خصوصية أنج بيوتي</h2>
          <p>
            توضح هذه السياسة كيف تجمع أنج بيوتي وتستخدم وتحمي المعلومات عند استخدام تطبيق أنج بيوتي
            للهواتف المحمولة أو موقع angebeauty.net والخدمات المرتبطة بهما (ويشار إليها مجتمعة باسم
            &quot;الخدمة&quot;).
          </p>
        </header>

        <section>
          <h3>1. المعلومات التي نجمعها</h3>
          <h4>المعلومات التي تقدمها لنا</h4>
          <ul>
            <li>معلومات الحساب، مثل الاسم والبريد الإلكتروني ورقم الهاتف وكلمة المرور المشفرة.</li>
            <li>معلومات الملف الشخصي والتوصيل، مثل العنوان والمدينة والمحافظة والرمز البريدي والدولة.</li>
            <li>معلومات الطلب، مثل المنتجات والكميات والأسعار ونقطة البيع وعنوان التوصيل وحالة الطلب.</li>
            <li>المفضلات وتفضيلات التواصل والموافقة على الرسائل الإلكترونية أو النصية.</li>
            <li>المعلومات التي ترسلها عند التواصل مع خدمة العملاء.</li>
          </ul>
          <h4>المعلومات التي تجمع تلقائياً</h4>
          <ul>
            <li>بيانات تقنية وأمنية محدودة، مثل عنوان IP ونوع المتصفح أو التطبيق وسجلات الأخطاء والطلبات.</li>
            <li>رمز إشعارات الجهاز ومعرف جهاز ينشئه التطبيق عند موافقتك على تلقي الإشعارات.</li>
            <li>بيانات استلام الإشعارات وفتحها، لقياس نجاح الإرسال وتحسين التواصل.</li>
            <li>ملفات تعريف الارتباط وبيانات التخزين المحلية اللازمة لتسجيل الدخول والسلة والمفضلات.</li>
          </ul>
          <p>لا نستخدم حالياً شبكات إعلانية خارجية، ولا نبيع بياناتك الشخصية.</p>
        </section>

        <section>
          <h3>2. كيف نستخدم المعلومات</h3>
          <ul>
            <li>إنشاء الحساب والتحقق منه وتسجيل الدخول وإدارة الملف الشخصي.</li>
            <li>إنشاء الطلبات ومعالجتها وتحديث حالتها وتنظيم التوصيل وخدمة ما بعد البيع.</li>
            <li>عرض المنتجات المتاحة والأسعار والعروض والمفضلات وسجل الطلبات.</li>
            <li>إرسال رسائل الحساب والطلب والإشعارات التي وافقت على استلامها.</li>
            <li>منع الاحتيال وإساءة الاستخدام وحماية الحسابات والخدمة.</li>
            <li>تشخيص الأعطال وتحسين الأداء وتجربة الاستخدام.</li>
            <li>الامتثال للمتطلبات القانونية والمحاسبية وحل النزاعات.</li>
          </ul>
        </section>

        <section>
          <h3>3. مشاركة المعلومات ومقدمو الخدمات</h3>
          <p>
            لا نبيع معلوماتك الشخصية. قد نشارك القدر الضروري منها مع مزودي الاستضافة والتخزين وشبكات
            توصيل المحتوى والبريد الإلكتروني والرسائل والإشعارات ومكافحة إساءة الاستخدام، ومع موظفي
            أنج بيوتي المخولين بتنفيذ الطلب أو تقديم الدعم. نطلب من مزودي الخدمات حماية البيانات
            واستخدامها فقط لتقديم الخدمة المتفق عليها.
          </p>
          <p>
            تستخدم الخدمة Cloudflare Turnstile للتحقق الأمني، وخدمات Expo لإيصال إشعارات التطبيق.
            قد يعالج هؤلاء المزودون بيانات تقنية وفق سياسات الخصوصية الخاصة بهم.
          </p>
          <p>
            قد نكشف المعلومات إذا كان ذلك مطلوباً بموجب القانون، أو لحماية الحقوق أو السلامة أو منع
            الاحتيال. وقد تتم معالجة البيانات في دول غير دولتك بحسب مواقع مزودي الخدمة، مع اتخاذ
            الإجراءات المناسبة لحمايتها.
          </p>
        </section>

        <section>
          <h3>4. الاحتفاظ بالبيانات وحمايتها</h3>
          <p>
            نحتفظ بالمعلومات طوال مدة نشاط الحساب وبالقدر اللازم لتنفيذ الطلبات وتقديم الخدمة والوفاء
            بالالتزامات القانونية والمحاسبية وحل النزاعات. قد نحتفظ بسجلات الطلبات والمعاملات التي
            يفرض القانون الاحتفاظ بها حتى بعد حذف الحساب. نحذف البيانات الأخرى أو نجعلها غير مرتبطة
            بهويتك عندما لا تعود هناك حاجة مشروعة إليها.
          </p>
          <p>
            نطبق وسائل حماية تقنية وتنظيمية مناسبة، ولكن لا توجد وسيلة نقل أو تخزين إلكتروني تضمن
            الأمان الكامل. يجب عليك حماية كلمة المرور وعدم مشاركتها.
          </p>
        </section>

        <section id="privacy-choices">
          <h3>5. اختياراتك وحقوقك</h3>
          <ul>
            <li>يمكنك مراجعة معلومات ملفك الشخصي وتعديلها من حسابك.</li>
            <li>يمكنك إيقاف الإشعارات من إعدادات الجهاز في أي وقت.</li>
            <li>يمكنك سحب موافقتك على الرسائل التسويقية عبر التواصل معنا.</li>
            <li>يمكنك طلب نسخة من بياناتك أو تصحيحها أو حذف حسابك وبياناتك، مع مراعاة متطلبات الاحتفاظ القانونية.</li>
          </ul>
          <p>
            لتقديم طلب خصوصية أو حذف حساب، راسلنا من البريد المرتبط بالحساب على
            {" "}<a href={`mailto:${email}`}>{email}</a> أو تواصل عبر واتساب على
            {" "}<a href={`https://wa.me/${phone.replace("+", "")}`}>{phone}</a>. قد نطلب معلومات
            إضافية للتحقق من هويتك قبل تنفيذ الطلب.
          </p>
        </section>

        <section>
          <h3>6. خصوصية الأطفال</h3>
          <p>
            الخدمة غير موجهة للأطفال الذين لا يملكون الأهلية القانونية لإنشاء حساب أو إجراء عملية شراء.
            إذا اعتقدت أن طفلاً قدم لنا معلومات دون موافقة ولي الأمر، فتواصل معنا لطلب حذفها.
          </p>
        </section>

        <section>
          <h3>7. التغييرات والتواصل</h3>
          <p>
            قد نحدث هذه السياسة عند تغير الخدمة أو المتطلبات القانونية. سننشر النسخة الجديدة في هذه
            الصفحة ونعدل تاريخ آخر تحديث. للاستفسارات المتعلقة بالخصوصية، تواصل معنا عبر
            {" "}<a href={`mailto:${email}`}>{email}</a> أو <a href={`tel:${phone}`}>{phone}</a>.
          </p>
        </section>
      </article>

      <article id="english" className="privacy-document privacy-document-english" dir="ltr" lang="en">
        <header>
          <p className="privacy-language-label">English</p>
          <h2>Ange Beauty Privacy Policy</h2>
          <p>
            This policy explains how Ange Beauty collects, uses, and protects information when you use
            the Ange Beauty mobile application, angebeauty.net, and related services (collectively, the
            &quot;Service&quot;).
          </p>
        </header>

        <section>
          <h3>1. Information we collect</h3>
          <h4>Information you provide</h4>
          <ul>
            <li>Account information, including your name, email address, telephone number, and encrypted password.</li>
            <li>Profile and delivery information, including address, city, province, postal code, and country.</li>
            <li>Order information, including products, quantities, prices, selling point, delivery address, and order status.</li>
            <li>Favorites, communication preferences, and email or SMS consent choices.</li>
            <li>Information you provide when contacting customer support.</li>
          </ul>
          <h4>Information collected automatically</h4>
          <ul>
            <li>Limited technical and security data, such as IP address, browser or app type, request logs, and error information.</li>
            <li>A push notification token and an app-generated device identifier when you allow notifications.</li>
            <li>Notification receipt and open events, used to measure delivery and improve communications.</li>
            <li>Cookies and local storage required for authentication, the basket, and favorites.</li>
          </ul>
          <p>We do not currently use third-party advertising networks, and we do not sell personal data.</p>
        </section>

        <section>
          <h3>2. How we use information</h3>
          <ul>
            <li>Create and verify accounts, authenticate users, and manage profiles.</li>
            <li>Create, process, update, and deliver orders and provide after-sales support.</li>
            <li>Display available products, prices, offers, favorites, and order history.</li>
            <li>Send account, order, and notification messages you have agreed to receive.</li>
            <li>Prevent fraud and abuse and protect accounts and the Service.</li>
            <li>Diagnose errors and improve performance and user experience.</li>
            <li>Meet legal and accounting obligations and resolve disputes.</li>
          </ul>
        </section>

        <section>
          <h3>3. Sharing and service providers</h3>
          <p>
            We do not sell personal information. We may share only the information needed with providers
            of hosting, storage, content delivery, email, messaging, push notifications, and abuse
            prevention, and with authorized Ange Beauty personnel who fulfill orders or provide support.
            We require providers to protect information and use it only to supply the agreed service.
          </p>
          <p>
            The Service uses Cloudflare Turnstile for security verification and Expo services to deliver
            app notifications. These providers may process technical data under their own privacy policies.
          </p>
          <p>
            We may disclose information where required by law, to protect rights or safety, or to prevent
            fraud. Data may be processed outside your country depending on provider locations, subject to
            appropriate safeguards.
          </p>
        </section>

        <section>
          <h3>4. Retention and security</h3>
          <p>
            We retain information while an account is active and as needed to fulfill orders, provide the
            Service, meet legal and accounting obligations, and resolve disputes. Order and transaction
            records required by law may remain after account deletion. Other information is deleted or
            de-identified when there is no longer a legitimate need for it.
          </p>
          <p>
            We use appropriate technical and organizational safeguards, but no electronic transmission or
            storage method can guarantee complete security. Keep your password confidential.
          </p>
        </section>

        <section id="privacy-choices-en">
          <h3>5. Your choices and rights</h3>
          <ul>
            <li>You can review and update profile information from your account.</li>
            <li>You can disable notifications through device settings at any time.</li>
            <li>You can withdraw marketing communication consent by contacting us.</li>
            <li>You can request access, correction, a copy of your information, or account and data deletion, subject to legal retention requirements.</li>
          </ul>
          <p>
            To make a privacy or account-deletion request, contact us from the email associated with your
            account at <a href={`mailto:${email}`}>{email}</a> or through WhatsApp at
            {" "}<a href={`https://wa.me/${phone.replace("+", "")}`}>{phone}</a>. We may request additional
            information to verify your identity before acting on a request.
          </p>
        </section>

        <section>
          <h3>6. Children&apos;s privacy</h3>
          <p>
            The Service is not directed to children who lack the legal capacity to create an account or
            make a purchase. If you believe a child provided information without parental consent, contact
            us to request its deletion.
          </p>
        </section>

        <section>
          <h3>7. Changes and contact</h3>
          <p>
            We may update this policy as the Service or legal requirements change. We will publish the new
            version here and revise the last-updated date. For privacy questions, contact
            {" "}<a href={`mailto:${email}`}>{email}</a> or <a href={`tel:${phone}`}>{phone}</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
