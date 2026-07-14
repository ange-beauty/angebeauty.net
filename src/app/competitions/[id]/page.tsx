import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  fetchCompetitionSnapshotServer,
  fetchProductsByIdsServer,
  mapCompetitionSnapshotProducts,
  type CompetitionAward,
  type CompetitionAwardProduct,
  type CompetitionParticipant,
  type CompetitionSnapshot,
  type CompetitionWinner,
} from "@/lib/serverApi";
import type { APIProduct } from "@/types/product";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const snapshot = await fetchCompetitionSnapshotServer(id);
  const title = snapshot ? competitionTitle(snapshot) : "مسابقة أنج بيوتي";

  return {
    title: `${title} | Ange Beauty`,
    description: "تابعي نتائج المسابقة وترتيب المشاركين مباشرة.",
  };
}

export default async function CompetitionPage({ params }: PageProps) {
  const { id } = await params;
  const snapshot = await fetchCompetitionSnapshotServer(id);

  if (!snapshot) {
    return (
      <main className="competition-page">
        <section className="competition-empty">
          <p className="competition-eyebrow">المسابقة</p>
          <h1>النتائج غير متاحة حالياً</h1>
          <p>لم يتم نشر لقطة التقييم لهذه المسابقة بعد. يرجى المحاولة لاحقاً.</p>
          <Link href="/home" className="competition-home-link">العودة للرئيسية</Link>
        </section>
      </main>
    );
  }

  const ranking = normalizeRanking(snapshot.ranking);
  const winners = normalizeWinners(snapshot, ranking);
  const isFinal = snapshotIsFinal(snapshot);
  const statusLabel = competitionStatusLabel(snapshot.status);
  const winnerKeys = new Set(winners.map((winner) => participantKey(winner)).filter(Boolean));
  const otherCommenters = ranking.filter((participant) => !winnerKeys.has(participantKey(participant)));
  const snapshotProducts = mapCompetitionSnapshotProducts(snapshot);
  const productIds = extractPrizeProductIds(snapshot, winners);
  const prizeProducts = snapshotProducts.length > 0
    ? snapshotProducts
    : await fetchProductsByIdsServer(productIds);

  return (
    <main className="competition-page">
      <section className="competition-hero">
        <div>
          <div className="competition-hero-tags">
            <p className="competition-eyebrow">نتائج المسابقة</p>
            <span className={`competition-status ${snapshot.status || "unknown"}`}>{statusLabel}</span>
          </div>
          <h1>{competitionTitle(snapshot)}</h1>
          <p className="competition-summary">
            {isFinal
              ? "الفائزون المعتمدون والجوائز النهائية معروضة من آخر لقطة تقييم."
              : "ترتيب المشاركين حسب عدد المنشنات. عند تساوي النتائج يتم ترتيب المشاركين حسب وقت أول تعليق."}
          </p>
        </div>
        <div className="competition-stats" aria-label="competition stats">
          <Stat label="الحالة" value={statusLabel} />
          <Stat label="تاريخ البداية" value={formatDate(snapshot.starts_at)} />
          <Stat label="تاريخ النهاية" value={formatDate(snapshot.ends_at)} />
          <Stat label="المشاركون" value={ranking.length || readNumber(snapshot.metadata?.participant_count)} />
          <Stat label="التعليقات" value={readNumber(snapshot.metadata?.comment_count)} />
          <Stat label="آخر تحديث" value={formatDate(snapshot.snapshot_updated_at || snapshot.evaluated_at)} />
        </div>
      </section>

      <section className="competition-section">
        <div className="competition-section-header">
          <h2>الجوائز</h2>
          <p>منتجات الفائزين حسب ترتيب المسابقة.</p>
        </div>
        {prizeProducts.length > 0 ? (
          <div className="grid-products competition-prize-grid">
            {prizeProducts.map((product) => (
              <ProductCard key={product.id} product={product} hidePrice />
            ))}
          </div>
        ) : (
          <p className="competition-muted">لم يتم نشر منتجات الجوائز في لقطة التقييم بعد.</p>
        )}
        {Array.isArray(snapshot.awards) && snapshot.awards.length > 0 ? (
          <div className="competition-awards">
            {snapshot.awards.map((award, index) => (
              <AwardSummary key={`${award.rank || index}`} award={award} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="competition-section">
        <div className="competition-section-header">
          <h2>{isFinal ? "الفائزون المعتمدون" : "الفائزون المقترحون"}</h2>
          <p>{isFinal ? "النتيجة النهائية بعد اعتماد الفائزين." : "أعلى المشاركين في الترتيب الحالي."}</p>
        </div>
        {winners.length > 0 ? (
          <div className="competition-winners">
            {winners.map((winner, index) => (
              <ParticipantRow key={participantKey(winner) || index} participant={winner} highlighted />
            ))}
          </div>
        ) : (
          <p className="competition-muted">لا يوجد فائزون في لقطة التقييم الحالية.</p>
        )}
      </section>

      <section className="competition-section">
        <div className="competition-section-header">
          <h2>باقي المشاركين</h2>
          <p>ترتيب باقي المشاركين حسب لقطة التقييم الحالية.</p>
        </div>
        {otherCommenters.length > 0 ? (
          <div className="competition-commenters">
            {otherCommenters.map((participant, index) => (
              <ParticipantRow key={participantKey(participant) || index} participant={participant} />
            ))}
          </div>
        ) : (
          <p className="competition-muted">لا يوجد مشاركون آخرون في لقطة التقييم الحالية.</p>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="competition-stat">
      <strong>{value || "-"}</strong>
      <span>{label}</span>
    </div>
  );
}

function AwardSummary({ award }: { award: CompetitionAward }) {
  const products = Array.isArray(award.products) ? award.products : [];
  return (
    <article className="competition-award">
      <strong>{rankLabel(readNumber(award.rank))}</strong>
      <div>
        {products.length > 0 ? (
          products.map((product, index) => (
            <span key={`${product.product_id || product.productId || index}`}>
              {readNumber(product.quantity) > 1 ? `${readNumber(product.quantity)} x ` : ""}
              {awardProductName(product)}
            </span>
          ))
        ) : (
          <span>-</span>
        )}
      </div>
    </article>
  );
}

function ParticipantRow({
  participant,
  highlighted = false,
}: {
  participant: CompetitionParticipant | CompetitionWinner;
  highlighted?: boolean;
}) {
  const username = instagramUsername(participant);
  const score = readNumber(participant.score);
  const rank = readNumber(participant.rank);
  const products = winnerProductNames(participant);

  return (
    <article className={highlighted ? "competition-person winner" : "competition-person"}>
      <div className="competition-rank">{rank ? `#${rank}` : "-"}</div>
      <div className="competition-person-main">
        <strong>{participant.display_name || username || participant.participant_key || "مشارك"}</strong>
        <span>{score} منشن</span>
        {products.length > 0 ? (
          <div className="competition-person-products">
            {products.map((product, index) => <em key={`${product}-${index}`}>{product}</em>)}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function competitionTitle(snapshot: CompetitionSnapshot) {
  return snapshot.name_ar || snapshot.name_en || snapshot.competition_id || "مسابقة أنج بيوتي";
}

function normalizeRanking(value: CompetitionSnapshot["ranking"]): CompetitionParticipant[] {
  return Array.isArray(value) ? value : [];
}

function normalizeWinners(snapshot: CompetitionSnapshot, ranking: CompetitionParticipant[]): CompetitionWinner[] {
  if (Array.isArray(snapshot.winners) && snapshot.winners.length > 0) {
    return snapshot.winners;
  }

  if (Array.isArray(snapshot.suggested_winners) && snapshot.suggested_winners.length > 0) {
    return snapshot.suggested_winners;
  }

  if (Array.isArray(snapshot.metadata?.suggested_winners) && snapshot.metadata.suggested_winners.length > 0) {
    return snapshot.metadata.suggested_winners;
  }

  const winnerCount = Math.max(1, Math.min(3, readNumber(snapshot.metadata?.winner_count) || 3));
  return ranking.slice(0, winnerCount).map((participant, index) => ({
    ...participant,
    rank: participant.rank || index + 1,
    awarded_products: [],
  }));
}

function extractPrizeProductIds(snapshot: CompetitionSnapshot, winners: CompetitionWinner[]) {
  const ids = new Set<string>();
  const addProduct = (product: CompetitionAwardProduct | null | undefined) => {
    const id = product?.product_id || product?.productId;
    if (id) ids.add(String(id));
  };
  const addAward = (award: CompetitionAward | null | undefined) => {
    if (Array.isArray(award?.products)) {
      award.products.forEach(addProduct);
    }
  };

  winners.forEach((winner) => {
    if (Array.isArray(winner.awarded_products)) {
      winner.awarded_products.forEach(addProduct);
    }
  });
  snapshot.awards?.forEach(addAward);
  snapshot.metadata?.awards?.forEach(addAward);

  return Array.from(ids);
}

function participantKey(participant: CompetitionParticipant | CompetitionWinner) {
  return String(participant.participant_key || instagramUsername(participant) || "").trim().toLowerCase();
}

function instagramUsername(participant: CompetitionParticipant | CompetitionWinner) {
  const raw = participant.instagram_username || participant.display_name || participant.participant_key || "";
  return String(raw).replace(/^instagram:/, "").replace(/^@/, "").trim();
}

function snapshotIsFinal(snapshot: CompetitionSnapshot) {
  return snapshot.is_final === true ||
    snapshot.is_final === 1 ||
    snapshot.is_final === "true" ||
    snapshot.status === "awarded" ||
    (Array.isArray(snapshot.winners) && snapshot.winners.length > 0);
}

function competitionStatusLabel(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "مباشرة";
    case "upcoming":
      return "قريباً";
    case "ended":
      return "انتهت";
    case "awarded":
      return "معتمدة";
    case "cancelled":
      return "ملغاة";
    default:
      return "غير محددة";
  }
}

function rankLabel(rank: number) {
  if (rank === 1) return "المركز الأول";
  if (rank === 2) return "المركز الثاني";
  if (rank === 3) return "المركز الثالث";
  return rank ? `#${rank}` : "-";
}

function winnerProductNames(participant: CompetitionParticipant | CompetitionWinner) {
  const products = Array.isArray((participant as CompetitionWinner).awarded_products)
    ? (participant as CompetitionWinner).awarded_products || []
    : [];

  return products.map(awardProductName).filter(Boolean);
}

function awardProductName(product: CompetitionAwardProduct) {
  const embedded = product.product as APIProduct | null | undefined;
  return productName(embedded) || String(product.product_id || product.productId || "");
}

function productName(product?: APIProduct | null) {
  return product?.name_ar || product?.name_en || product?.name || "";
}

function readNumber(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ar-IQ", {
    timeZone: "Asia/Baghdad",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
