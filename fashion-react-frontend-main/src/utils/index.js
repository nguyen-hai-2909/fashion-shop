import { colorsList } from "../constants";

export const getSortType = () => {
  const data = localStorage.getItem("sortType");
  if (data === "nameA" || data === "nameZ") return "priceLowest";
  return data ? data : "priceLowest";
};

export const getTypeRender = () => {
  const data = localStorage.getItem("typeRender");
  if (data === "true") {
    return true;
  } else if (data === "false") {
    return false;
  } else {
    return true;
  }
};

export const token = JSON.parse(localStorage.getItem("token"));
export const tokenAdmin = JSON.parse(localStorage.getItem("token-admin"));

export const handleRenderSubtotalCart = (products) => {
  const subTotal = products.reduce((result, current) => {
    if (current?.amount <= current.maxAmount) {
      return result + current.amount * current.price;
    } else {
      return result + current.maxAmount * current.price;
    }
  }, 0);
  return subTotal;
};

export const handleRenderTotalDiscount = (
  discountCode,
  valueDiscount,
  products
) => {
  if (!discountCode) {
    return 0;
  } else {
    if (valueDiscount?.includes("%")) {
      const valueNumber = Number(valueDiscount?.split("%")[0]);
      return ((handleRenderSubtotalCart(products) / 100) * valueNumber).toFixed(
        2
      );
    } else {
      return Number(valueDiscount);
    }
  }
};

export const renderTotalAmountCartProducts = (products) => {
  const total = products?.reduce((result, current) => {
    if (current.amount <= current.maxAmount) {
      return result + current.amount;
    } else {
      return result + current.maxAmount;
    }
  }, 0);

  return products ? total : 0;
};

export const FREE_SHIPPING_THRESHOLD = 1999000;
export const STANDARD_SHIPPING_FEE = 50000;

export const renderShippingFee = (products) => {
  const subtotal = handleRenderSubtotalCart(products);
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
};

const normalizeHexKey = (hex) => {
  if (!hex) return "";
  let h = String(hex).trim();
  if (!h.startsWith("#")) h = `#${h}`;
  return h.toUpperCase();
};

/** Map hex code to catalog color name (e.g. #A67C52 → Brown-Beige). */
export const colorLabelFromValue = (value) => {
  if (value == null || value === "") return "—";
  const v = String(value).trim();
  const fromList = colorsList.find(
    (c) => normalizeHexKey(c.value) === normalizeHexKey(v)
  );
  if (fromList) return fromList.label;
  if (v.startsWith("#")) return v;
  return v;
};

/** e.g. "#A67C52 / S" → "Brown-Beige / S" */
export const formatVariantTitle = (title) => {
  if (title == null || title === "") return "—";
  const parts = String(title).split(/\s*\/\s*/);
  if (parts.length >= 2) {
    const size = parts.slice(1).join(" / ").trim();
    const colorLabel = colorLabelFromValue(parts[0].trim());
    return size ? `${colorLabel} / ${size}` : colorLabel;
  }
  return colorLabelFromValue(parts[0].trim());
};

/** Cart / checkout: color may be a string (hex or name) or legacy nested object. */
export const displayColorLabel = (color) => {
  if (color == null) return "—";
  if (typeof color === "string") return colorLabelFromValue(color);
  if (typeof color === "object") {
    if (color.label) return String(color.label);
    if (color.name) return colorLabelFromValue(color.name);
    if (color.hex) return colorLabelFromValue(color.hex);
  }
  return "—";
};

export const formatCurrency = (money) => {
  const n = Number(money);
  if (!Number.isFinite(n)) {
    return "—";
  }
  return n.toLocaleString("vi", {
    style: "currency",
    currency: "VND",
  });
};

export const getArrLast7Days = () => {
  const arr = [];
  for (let index = 6; index >= 0; index--) {
    const today = new Date();
    const date = new Date(today.setDate(today.getDate() - index))
      .toISOString()
      .slice(0, 10);
    arr.push(date);
  }
  return arr;
};
const dateDiffInDays = (a, b) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

/** Placeholder when product has no image (avoids crashing on `.url`). */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#eee" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14" font-family="system-ui,sans-serif">No image</text></svg>'
  );

/** Safe URL for `product.images[index]`. */
export const productImageUrl = (images, index = 0) => {
  const arr = Array.isArray(images) ? images : [];
  const u = arr[index]?.url;
  return u && String(u).trim() !== "" ? u : PLACEHOLDER_IMAGE;
};

/** Safe URL for cart line `image` object. */
export const cartImageUrl = (image) => {
  const u = image?.url;
  return u && String(u).trim() !== "" ? u : PLACEHOLDER_IMAGE;
};

/** Display payment method label (COD / bank transfer). */
export const formatPaymentMethod = (method) => {
  const m = String(method ?? "").toLowerCase();
  if (m === "cod") return "Cash on delivery (COD)";
  if (m === "transfer") return "Bank transfer";
  if (m === "vnpay") return "VNPay";
  return method ? String(method) : "—";
};

export const getArrDays = (start, end) => {
  let arr = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const difference = dateDiffInDays(startDate, endDate);
  for (let index = difference; index >= 0; index--) {
    const today = new Date();
    const date = new Date(today.setDate(today.getDate() - index))
      .toISOString()
      .slice(0, 10);
    arr.push(date);
  }
  return arr;
};
