export type ProductVariationGroup = {
  id: string;
  options: { id: string; name_ar: string; display_type: string;
    values: { id: string; name_ar: string; color_hex?: string; image_url?: string }[] }[];
  members: { product_id: string; is_active: boolean; option_values: Record<string, string> }[];
};
