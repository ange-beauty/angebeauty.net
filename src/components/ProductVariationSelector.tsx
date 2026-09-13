import type { ProductVariationGroup } from "@/types/productVariations";
import styles from "./ProductVariationSelector.module.css";

export default function ProductVariationSelector({ group, productId }: { group: ProductVariationGroup; productId: string }) {
  const current = group.members.find((member) => member.product_id === productId);
  if (!current) return null;
  return <div className={styles.root} dir="rtl">
    {group.options.map((option) => <fieldset key={option.id} className={styles.option}>
      <legend>{option.name_ar}</legend>
      <div className={styles.values}>{option.values.map((value) => {
        const candidates = group.members.filter((member) => member.is_active && member.option_values[option.id] === value.id);
        const target = candidates.find((member) => group.options.every((other) => other.id === option.id ||
          member.option_values[other.id] === current.option_values[other.id])) || candidates[0];
        const content = <>
          {option.display_type === "color" && value.color_hex && <span className={styles.swatch} style={{ backgroundColor: value.color_hex }} />}
          {option.display_type === "image" && value.image_url && <img src={value.image_url} alt="" className={styles.image} />}
          {value.name_ar}
        </>;
        return target ? <a key={value.id} href={`/product/${encodeURIComponent(target.product_id)}`} className={styles.value}
          aria-current={current.option_values[option.id] === value.id ? "true" : undefined}>{content}</a>
          : <span key={value.id} aria-disabled="true" className={styles.value}>{content}</span>;
      })}</div>
    </fieldset>)}
  </div>;
}
