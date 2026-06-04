export function truncateText(text, maxLen) {
  const s = String(text ?? "").trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}...`;
}

/** Discount % when compare (original) price is higher than selling price. */
export function calcDiscountPercent(price, compareAtPrice) {
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!Number.isFinite(p) || !Number.isFinite(c) || c <= p || p <= 0) {
    return 0;
  }
  return Math.round(100 - (p / c) * 100);
}

export function hasCompareDiscount(price, compareAtPrice) {
  const p = Number(price);
  const c = Number(compareAtPrice);
  return Number.isFinite(p) && Number.isFinite(c) && c > p;
}

/**
 * Variant row from API (stock or variants).
 * Product-level compareAtPrice applies only when variant price <= compare.
 * If variant price > compare → use variant price only (no strikethrough / badge).
 */
export function resolveVariantPricing(variant, productCompareAtPrice = null) {
  const price = Number(variant?.price ?? 0);
  const rawCompare =
    variant?.compareAtPrice ??
    variant?.compare_at_price ??
    productCompareAtPrice ??
    null;
  const compareAtPrice =
    rawCompare != null && rawCompare !== "" ? Number(rawCompare) : null;

  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(compareAtPrice) ||
    compareAtPrice <= 0 ||
    price > compareAtPrice
  ) {
    return {
      price,
      compareAtPrice: null,
      discountPercent: 0,
      onSale: false,
    };
  }

  const onSale = hasCompareDiscount(price, compareAtPrice);
  return {
    price,
    compareAtPrice: onSale ? compareAtPrice : null,
    discountPercent: onSale ? calcDiscountPercent(price, compareAtPrice) : 0,
    onSale,
  };
}

/** Catalog card: lowest active variant price + compare when variant price <= compare. */
export function resolveProductListPricing(product) {
  const productCompare =
    product?.compareAtPrice != null && product?.compareAtPrice !== ""
      ? Number(product.compareAtPrice)
      : null;

  const rows = product?.stock || product?.variants || [];
  let best = null;
  let minPrice = Infinity;

  for (const row of rows) {
    if (row?.isActive === false) continue;
    const p = Number(row?.price ?? 0);
    if (!Number.isFinite(p) || p <= 0) continue;
    if (p < minPrice) {
      minPrice = p;
      best = row;
    }
  }

  if (best) {
    return resolveVariantPricing(best, productCompare);
  }

  return resolveVariantPricing(
    { price: product?.price ?? 0 },
    productCompare
  );
}
