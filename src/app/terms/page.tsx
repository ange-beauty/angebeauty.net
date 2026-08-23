import type { Metadata } from "next";

const email = "support@angebeauty.net";
const phone = "+9647761791777";

export const metadata: Metadata = {
  title: "شروط الاستخدام | Terms of Use | أنج بيوتي",
  description: "شروط استخدام موقع وتطبيق أنج بيوتي باللغة العربية والإنجليزية.",
  alternates: {
    canonical: "https://www.angebeauty.net/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-hero">
        <p className="privacy-brand">ANGE BEAUTY | أنج بيوتي</p>
        <h1>شروط الاستخدام <span>Terms of Use</span></h1>
        <p>آخر تحديث: 23 أغسطس 2026 | Last updated: August 23, 2026</p>
        <nav className="privacy-language-nav" aria-label="Terms of use languages">
          <a href="#arabic">العربية</a>
          <a href="#english">English</a>
        </nav>
      </header>

      <article id="arabic" className="privacy-document" dir="rtl" lang="ar">
        <header>
          <p className="privacy-language-label">العربية</p>
          <h2>شروط استخدام أنج بيوتي</h2>
          <p>
            تنظم هذه الشروط استخدامك لموقع angebeauty.net وتطبيق أنج بيوتي للهاتف والخدمات المرتبطة
            بهما (ويشار إليها مجتمعة باسم &quot;الخدمة&quot;). مقدم الخدمة هو أنج بيوتي في جمهورية
            العراق. باستخدام الخدمة أو إنشاء حساب أو تقديم طلب، فإنك تقر بأنك قرأت هذه الشروط
            ووافقت عليها. إذا لم توافق عليها، فلا تستخدم الخدمة.
          </p>
        </header>

        <section>
          <h3>1. الأهلية والحسابات</h3>
          <ul>
            <li>يجب أن تكون متمتعاً بالأهلية القانونية لإبرام عقد شراء، أو تستخدم الخدمة بإشراف ولي أمرك.</li>
            <li>يجب تقديم معلومات صحيحة وحديثة، وحماية كلمة المرور وعدم السماح للغير باستخدام الحساب.</li>
            <li>أنت مسؤول عن النشاط المنفذ من حسابك، وعليك إبلاغنا فوراً عند الاشتباه في استخدام غير مصرح به.</li>
            <li>يجوز لنا طلب التحقق من معلومات الحساب أو الطلب للحماية من الاحتيال وإساءة الاستخدام.</li>
          </ul>
        </section>

        <section>
          <h3>2. المنتجات ومعلومات مستحضرات التجميل</h3>
          <p>
            نبذل جهداً معقولاً لعرض أسماء المنتجات وصورها وألوانها وأحجامها ومكوناتها ووصفها بدقة،
            لكن قد توجد فروقات طفيفة بسبب الشاشة أو التغليف أو تحديثات الشركة المصنعة. صورة المنتج
            توضيحية ولا تغني عن قراءة الملصق الموجود على العبوة.
          </p>
          <p>
            المعلومات المعروضة ليست تشخيصاً أو نصيحة طبية. اقرأ تعليمات المنتج والتحذيرات والمكونات
            قبل الاستخدام، ولا تستخدم المنتج عند وجود حساسية معروفة لأحد مكوناته. أوقف الاستخدام عند
            حدوث تهيج أو رد فعل غير متوقع واطلب المشورة الطبية المناسبة. لا نغير مسؤولية المصنع أو
            حقوقك القانونية المتعلقة بمنتج معيب أو غير مطابق.
          </p>
        </section>

        <section>
          <h3>3. الأسعار والتوفر والعروض</h3>
          <ul>
            <li>تظهر الأسعار بالعملة المحددة في الخدمة، وتطبق الأسعار المؤكدة عند إتمام الطلب.</li>
            <li>المنتجات والأسعار والعروض والكميات خاضعة للتوفر وقد تختلف حسب نقطة البيع.</li>
            <li>إذا ظهر خطأ واضح في السعر أو الوصف أو التوفر، سنتواصل معك للتصحيح أو إلغاء الجزء المتأثر وإعادة أي مبلغ مستحق.</li>
            <li>تخضع العروض لتاريخها ونطاقها وشروطها، ولا تجمع مع عروض أخرى إلا إذا ذكر خلاف ذلك.</li>
          </ul>
        </section>

        <section>
          <h3>4. الطلب وتكوين العقد</h3>
          <p>
            وضع منتج في السلة أو إرسال الطلب لا يضمن التوفر ولا يعني قبول الطلب نهائياً. إشعار استلام
            الطلب هو إقرار بالاستلام فقط. يصبح الطلب مؤكداً عندما تؤكده أنج بيوتي أو تبدأ تجهيزه، حسب
            ما يظهر في حالة الطلب. يجوز رفض أو إلغاء الطلب عند نفاد المخزون، أو تعذر التحقق من المعلومات،
            أو الاشتباه في الاحتيال، أو وجود خطأ جوهري، مع إعادة أي مبلغ واجب الإعادة.
          </p>
        </section>

        <section>
          <h3>5. الدفع</h3>
          <p>
            يجب استخدام وسيلة دفع مصرح لك باستخدامها. تعتمد وسائل الدفع المتاحة على الطلب ونقطة البيع.
            عند إتاحة الدفع المؤجل أو الجزئي، يبقى المبلغ غير المدفوع مستحقاً وفق الاتفاق وحالة الطلب،
            ولا يؤثر ذلك في حقوق المستهلك الإلزامية. لا ترسل بيانات بطاقة الدفع عبر البريد أو الرسائل.
          </p>
        </section>

        <section>
          <h3>6. التوصيل والاستلام</h3>
          <ul>
            <li>يجب تقديم عنوان ورقم هاتف صحيحين وإتاحة وسيلة معقولة للتواصل عند التوصيل.</li>
            <li>مواعيد التوصيل تقديرية وقد تتأثر بالموقع والطقس والازدحام والظروف الخارجة عن السيطرة المعقولة.</li>
            <li>افحص الطلب عند الاستلام وأبلغنا دون تأخير مع رقم الطلب عند وجود نقص أو تلف أو منتج غير صحيح.</li>
            <li>لا تنتقل مخاطر المنتج إليك إلا وفق ما يسمح به القانون الواجب التطبيق.</li>
          </ul>
        </section>

        <section>
          <h3>7. الإلغاء والإرجاع والاسترداد</h3>
          <p>
            تواصل معنا بأسرع وقت لطلب الإلغاء أو الإرجاع. تعتمد إمكانية الإلغاء على مرحلة تجهيز الطلب.
            قد تقيد إعادة مستحضرات التجميل المفتوحة أو المستخدمة لأسباب صحية وسلامة عندما يسمح القانون
            بذلك. لا تنطبق هذه القيود على الحقوق الإلزامية المتعلقة بمنتج معيب أو تالف أو غير مطابق أو
            مرسل بالخطأ. سنوضح خطوات الإرجاع وطريقة الاسترداد المناسبة لكل حالة، ولا تستبعد هذه الشروط
            أي حق لا يجوز استبعاده بموجب القانون.
          </p>
        </section>

        <section>
          <h3>8. الاستخدام المقبول</h3>
          <p>لا يجوز لك:</p>
          <ul>
            <li>استخدام الخدمة بطريقة غير قانونية أو احتيالية أو لانتحال شخصية الغير.</li>
            <li>اختبار أمن الخدمة دون تصريح، أو تجاوز ضوابط الوصول، أو نشر برمجيات ضارة.</li>
            <li>استخدام أدوات آلية لجمع البيانات أو تعطيل الخدمة أو تنفيذ طلبات وهمية.</li>
            <li>نسخ المحتوى أو العلامات أو الصور أو استغلالها تجارياً دون إذن أو سند قانوني.</li>
          </ul>
        </section>

        <section>
          <h3>9. الملكية الفكرية وترخيص التطبيق</h3>
          <p>
            تبقى الخدمة وبرمجياتها وتصميمها ومحتواها وعلاماتها مملوكة لأنج بيوتي أو لأصحاب الحقوق.
            نمنحك ترخيصاً شخصياً محدوداً وغير حصري وغير قابل للتحويل لاستخدام التطبيق على أجهزة تملكها
            أو تتحكم بها وفق هذه الشروط وقواعد متجر التطبيقات. لا يجوز نسخ التطبيق أو تعديله أو تفكيكه
            أو محاولة استخراج شفرته إلا بالقدر الذي يسمح به القانون صراحة.
          </p>
        </section>

        <section>
          <h3>10. الخصوصية والاتصالات</h3>
          <p>
            توضح <a href="/privacy">سياسة الخصوصية</a> كيفية جمع المعلومات واستخدامها وحمايتها وحقوقك
            بشأنها. رسائل التحقق والأمان والطلب ضرورية لتقديم الخدمة. لا يعني قبول هذه الشروط موافقة
            تلقائية على التسويق؛ تدير الموافقة التسويقية بشكل منفصل حيثما تتوفر.
          </p>
        </section>

        <section>
          <h3>11. خدمات الغير ومتاجر التطبيقات</h3>
          <p>
            قد تعتمد الخدمة على مزودي استضافة وتخزين وإشعارات وخرائط وروابط خارجية. يخضع استخدام خدمات
            الغير لشروطهم أيضاً، ولسنا مسؤولين عن محتواهم أو انقطاعهم خارج سيطرتنا المعقولة.
          </p>
          <p>
            إذا حصلت على التطبيق من متجر Apple، فإن هذا الاتفاق بينك وبين أنج بيوتي وليس Apple. أنج
            بيوتي مسؤولة عن التطبيق وصيانته ودعمه ومعالجة المطالبات المتعلقة به، بما فيها مطالبات المنتج
            أو الامتثال أو الملكية الفكرية، بالقدر المطلوب قانوناً. Apple غير ملزمة بتقديم الدعم. تقر بأن
            Apple وشركاتها التابعة مستفيدون من هذه الشروط ويجوز لهم إنفاذ أحكامها المتعلقة بالتطبيق.
            يجب الالتزام بقواعد المتجر وشروط الجهات الخارجية، وألا تكون خاضعاً لقائمة أطراف محظورة تمنع
            قانوناً استخدام التطبيق.
          </p>
        </section>

        <section>
          <h3>12. توفر الخدمة والتغييرات</h3>
          <p>
            قد تتوقف الخدمة مؤقتاً للصيانة أو بسبب أعطال أو ظروف خارجة عن السيطرة المعقولة. يجوز تعديل
            الميزات أو إيقافها، لكن ذلك لا يؤثر في الطلبات المؤكدة أو الحقوق التي نشأت قبل التغيير إلا
            بالقدر الذي يسمح به القانون.
          </p>
        </section>

        <section>
          <h3>13. إخلاء المسؤولية وحدودها</h3>
          <p>
            تقدم الخدمة &quot;كما هي&quot; و&quot;حسب التوفر&quot; بالقدر الذي يسمح به القانون. لا نستبعد أو نحد من
            المسؤولية التي لا يجوز استبعادها قانوناً، بما في ذلك الحقوق الإلزامية للمستهلك، أو الاحتيال،
            أو الخطأ الجسيم، أو المسؤولية عن الوفاة أو الإصابة عندما يمنع القانون تقييدها. وفي غير ذلك،
            لا نتحمل الخسائر غير المباشرة أو غير المتوقعة بشكل معقول الناتجة عن استخدام الخدمة.
          </p>
        </section>

        <section>
          <h3>14. تعليق الحساب أو إنهاؤه</h3>
          <p>
            يمكنك التوقف عن استخدام الخدمة وطلب حذف حسابك وفق سياسة الخصوصية. يجوز لنا تقييد الحساب أو
            تعليقه عند خرق هذه الشروط أو وجود خطر أمني أو احتيالي، مع مراعاة الطلبات القائمة والحقوق
            القانونية. تبقى الأحكام التي بطبيعتها تستمر بعد الإنهاء نافذة.
          </p>
        </section>

        <section>
          <h3>15. القانون وحل النزاعات</h3>
          <p>
            تخضع هذه الشروط لقوانين جمهورية العراق. حاول التواصل معنا أولاً لحل الشكوى ودياً. تختص
            المحاكم العراقية المختصة بالنزاع، مع بقاء أي حقوق أو اختصاصات إلزامية يمنحها قانون حماية
            المستهلك أو أي قانون واجب التطبيق دون انتقاص.
          </p>
        </section>

        <section>
          <h3>16. تعديل الشروط والتواصل</h3>
          <p>
            قد نحدث هذه الشروط عند تغير الخدمة أو القانون. سننشر النسخة الجديدة وتاريخها هنا، وسنطلب
            موافقة جديدة عندما يكون التغيير جوهرياً أو يوجب القانون ذلك. للاستفسارات أو الشكاوى، تواصل
            مع أنج بيوتي في جمهورية العراق عبر <a href={`mailto:${email}`}>{email}</a> أو
            {" "}<a href={`tel:${phone}`}>{phone}</a>.
          </p>
        </section>
      </article>

      <article id="english" className="privacy-document privacy-document-english" dir="ltr" lang="en">
        <header>
          <p className="privacy-language-label">English</p>
          <h2>Ange Beauty Terms of Use</h2>
          <p>
            These Terms govern your use of angebeauty.net, the Ange Beauty mobile application, and related
            services (collectively, the &quot;Service&quot;). The Service is provided by Ange Beauty in the Republic
            of Iraq. By using the Service, creating an account, or placing an order, you acknowledge that you
            have read and accepted these Terms. Do not use the Service if you do not agree.
          </p>
        </header>

        <section>
          <h3>1. Eligibility and accounts</h3>
          <ul>
            <li>You must have legal capacity to enter a purchase contract or use the Service under guardian supervision.</li>
            <li>Provide accurate, current information and keep your password and account secure.</li>
            <li>You are responsible for account activity and must promptly report suspected unauthorized use.</li>
            <li>We may verify account or order information to prevent fraud and abuse.</li>
          </ul>
        </section>

        <section>
          <h3>2. Products and cosmetic information</h3>
          <p>
            We take reasonable care to present product names, images, colors, sizes, ingredients, and
            descriptions accurately. Minor differences may result from screens, packaging, or manufacturer
            updates. Images are illustrative and do not replace the label on the delivered product.
          </p>
          <p>
            Product information is not medical advice or diagnosis. Read labels, instructions, warnings,
            and ingredients before use. Do not use a product if you know you are allergic to an ingredient.
            Stop use following irritation or an unexpected reaction and seek appropriate medical advice.
            Nothing in these Terms changes manufacturer responsibility or your legal rights for defective
            or non-conforming goods.
          </p>
        </section>

        <section>
          <h3>3. Prices, availability, and promotions</h3>
          <ul>
            <li>Prices are displayed in the currency identified by the Service and the confirmed order price applies.</li>
            <li>Products, prices, promotions, and quantities remain subject to availability and may differ by selling point.</li>
            <li>For an obvious pricing, description, or availability error, we may correct or cancel the affected item and return any amount due.</li>
            <li>Promotions are subject to their dates, scope, and stated conditions and cannot be combined unless stated otherwise.</li>
          </ul>
        </section>

        <section>
          <h3>4. Orders and contract formation</h3>
          <p>
            Adding an item to the basket or submitting an order does not guarantee availability or final
            acceptance. An order-received message only acknowledges receipt. An order becomes confirmed
            when Ange Beauty confirms or begins processing it, as reflected in its status. We may reject or
            cancel an order because of unavailable stock, failed verification, suspected fraud, or a material
            error, and will return any refundable amount due.
          </p>
        </section>

        <section>
          <h3>5. Payment</h3>
          <p>
            Use only a payment method you are authorized to use. Available methods depend on the order and
            selling point. Where deferred or partial payment is offered, the unpaid balance remains due under
            the agreement and order status, without limiting mandatory consumer rights. Do not send payment
            card details by email or messaging.
          </p>
        </section>

        <section>
          <h3>6. Delivery and collection</h3>
          <ul>
            <li>Provide an accurate address and telephone number and remain reasonably reachable for delivery.</li>
            <li>Delivery times are estimates and may be affected by location, weather, traffic, and circumstances outside reasonable control.</li>
            <li>Inspect the order on receipt and promptly report a shortage, damage, or incorrect item with the order number.</li>
            <li>Product risk passes only as permitted by applicable law.</li>
          </ul>
        </section>

        <section>
          <h3>7. Cancellation, returns, and refunds</h3>
          <p>
            Contact us promptly to request cancellation or return. Cancellation depends on the processing
            stage. Where lawful, health and safety considerations may restrict returns of opened or used
            cosmetics. Those restrictions do not remove mandatory rights concerning defective, damaged,
            non-conforming, or incorrectly supplied goods. We will provide the appropriate return and refund
            steps for each case. These Terms do not exclude any right that cannot legally be excluded.
          </p>
        </section>

        <section>
          <h3>8. Acceptable use</h3>
          <p>You must not:</p>
          <ul>
            <li>Use the Service unlawfully, fraudulently, or to impersonate another person.</li>
            <li>Test security without authorization, bypass access controls, or distribute malicious code.</li>
            <li>Use automated tools to scrape data, disrupt the Service, or create false orders.</li>
            <li>Copy or commercially exploit content, brands, or images without permission or a legal right.</li>
          </ul>
        </section>

        <section>
          <h3>9. Intellectual property and app license</h3>
          <p>
            The Service, software, design, content, and branding remain owned by Ange Beauty or their rights
            holders. We grant you a limited, personal, non-exclusive, non-transferable license to use the app
            on devices you own or control under these Terms and applicable app-store usage rules. You may not
            copy, modify, reverse engineer, disassemble, or attempt to derive source code except where the law
            expressly permits it.
          </p>
        </section>

        <section>
          <h3>10. Privacy and communications</h3>
          <p>
            Our <a href="/privacy">Privacy Policy</a> explains how we collect, use, and protect information
            and describes your choices. Account verification, security, and order messages are necessary to
            supply the Service. Accepting these Terms does not automatically opt you into marketing; marketing
            consent is managed separately where offered.
          </p>
        </section>

        <section>
          <h3>11. Third-party services and app stores</h3>
          <p>
            The Service may rely on hosting, storage, notification, map, and other third-party services or
            external links. Their own terms may also apply. We are not responsible for third-party content or
            interruptions outside our reasonable control.
          </p>
          <p>
            If you obtained the app through Apple, this agreement is between you and Ange Beauty, not Apple.
            Ange Beauty, not Apple, is responsible for the app, maintenance, support, and claims concerning
            the app, including product, legal-compliance, and intellectual-property claims, to the extent
            required by law. Apple has no support obligation. Apple and its subsidiaries are third-party
            beneficiaries of these Terms and may enforce the app-related provisions. You must comply with
            app-store and applicable third-party terms and must not be a legally prohibited or restricted party.
          </p>
        </section>

        <section>
          <h3>12. Availability and changes</h3>
          <p>
            The Service may be temporarily unavailable for maintenance, failures, or circumstances outside
            reasonable control. We may change or discontinue features, but this will not affect confirmed
            orders or rights accrued before the change except as legally permitted.
          </p>
        </section>

        <section>
          <h3>13. Disclaimers and liability</h3>
          <p>
            To the extent permitted by law, the Service is provided &quot;as is&quot; and &quot;as available.&quot; We do not
            exclude or limit liability that cannot legally be excluded, including mandatory consumer rights,
            fraud, gross fault, or liability for death or personal injury where restriction is prohibited.
            Otherwise, we are not responsible for indirect losses that were not reasonably foreseeable from
            use of the Service.
          </p>
        </section>

        <section>
          <h3>14. Account suspension and termination</h3>
          <p>
            You may stop using the Service and request account deletion as described in the Privacy Policy.
            We may restrict or suspend an account for breach, security risk, or suspected fraud, while respecting
            pending orders and legal rights. Provisions intended by their nature to survive remain effective.
          </p>
        </section>

        <section>
          <h3>15. Governing law and disputes</h3>
          <p>
            These Terms are governed by the laws of the Republic of Iraq. Please contact us first so we can
            try to resolve a complaint informally. Competent Iraqi courts have jurisdiction, without reducing
            any mandatory consumer-law right or jurisdiction available under applicable law.
          </p>
        </section>

        <section>
          <h3>16. Changes and contact</h3>
          <p>
            We may update these Terms when the Service or law changes. We will publish the revised version and
            date here and request renewed acceptance where a change is material or legally required. Questions
            and complaints may be directed to Ange Beauty in the Republic of Iraq at
            {" "}<a href={`mailto:${email}`}>{email}</a> or <a href={`tel:${phone}`}>{phone}</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
