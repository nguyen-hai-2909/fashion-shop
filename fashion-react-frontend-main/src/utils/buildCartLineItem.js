/** Build a cart line item from product detail + selected variant. */
export function buildCartLineItem(detailProduct, stockCurrent, amountProduct, resolvedProductId) {
  if (!detailProduct || !stockCurrent) return null;

  const colorForCart =
    typeof stockCurrent.color === "object" && stockCurrent.color != null
      ? stockCurrent.color.name || stockCurrent.color.label || ""
      : stockCurrent.color;

  return {
    id: `${resolvedProductId}_${stockCurrent._id}`,
    slug: detailProduct.slug,
    price: stockCurrent.price ?? detailProduct.price,
    color: colorForCart,
    size: stockCurrent.size,
    amount: amountProduct,
    maxAmount: stockCurrent.amount,
    name: detailProduct.name,
    image: {
      url: stockCurrent.imageUrl || detailProduct.images?.[0]?.url || "",
    },
  };
}
