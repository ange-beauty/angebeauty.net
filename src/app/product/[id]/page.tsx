import { notFound, permanentRedirect } from "next/navigation";
import { fetchProductByIdServer } from "@/lib/serverApi";
import { productHref } from "@/lib/productUrl";

export default async function ProductIdRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductByIdServer(id);

  if (!product) {
    notFound();
  }

  permanentRedirect(productHref(product));
}
