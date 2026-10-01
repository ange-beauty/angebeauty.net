type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>> | null | undefined;
};

/** Server-rendered JSON-LD. `<` is escaped so API strings cannot close the script tag. */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
