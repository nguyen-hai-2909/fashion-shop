import PropTypes from "prop-types";
import { formatCurrency } from "../../utils";
import { resolveProductListPricing, resolveVariantPricing } from "../../utils/productPricing";

const ProductPriceDisplay = ({
  product,
  variant,
  layout = "card",
  className = "",
}) => {
  const pricing = variant
    ? resolveVariantPricing(variant, product?.compareAtPrice)
    : resolveProductListPricing(product);

  const { price, compareAtPrice, discountPercent, onSale } = pricing;
  const isInline = layout === "detail" || layout === "inline";
  const isListView = className.includes("product-price-block--list");

  if (isInline) {
    return (
      <div
        className={`product-price-inline ${layout === "detail" ? "product-price-detail" : ""} ${className}`.trim()}
      >
        <span className="product-price-inline__sale">{formatCurrency(price)}</span>
        {onSale && (
          <>
            <del className="product-price-inline__compare compare-price">
              {formatCurrency(compareAtPrice)}
            </del>
            {!isListView && (
              <span className="product-discount-badge product-discount-badge--inline">
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`product-price-block ${className}`.trim()}>
      <p className="product-price-block__sale">{formatCurrency(price)}</p>
      {onSale && (
        <p className="product-price-block__compare">
          <del className="compare-price">{formatCurrency(compareAtPrice)}</del>
        </p>
      )}
    </div>
  );
};

ProductPriceDisplay.propTypes = {
  product: PropTypes.object,
  variant: PropTypes.object,
  layout: PropTypes.oneOf(["card", "detail", "inline"]),
  className: PropTypes.string,
};

export default ProductPriceDisplay;

export function ProductDiscountBadge({ product, variant, className = "" }) {
  const pricing = variant
    ? resolveVariantPricing(variant, product?.compareAtPrice)
    : resolveProductListPricing(product);
  if (!pricing.onSale || pricing.discountPercent <= 0) return null;
  return (
    <span className={`product-discount-badge product-discount-badge--card ${className}`.trim()}>
      -{pricing.discountPercent}%
    </span>
  );
}

ProductDiscountBadge.propTypes = {
  product: PropTypes.object,
  variant: PropTypes.object,
  className: PropTypes.string,
};
