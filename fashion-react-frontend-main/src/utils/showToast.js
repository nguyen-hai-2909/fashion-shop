import { toast } from "react-toastify";

/**
 * Short, affirmative copy (Shopify Polaris toast guidelines).
 * @see https://polaris-react.shopify.com/components/deprecated/toast
 */
export function compactToastMessage(msg) {
  const text = String(msg ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const known = {
    "add product successfully": "Product added",
    "thêm vào giỏ hàng thành công": "Product added",
    "đăng ký nhận tin thành công": "Thanks for subscribing",
    "subscribe success": "Thanks for subscribing",
    "message sent": "Message sent",
  };
  const key = text.toLowerCase();
  if (known[key]) return known[key];

  const parts = text.split(/[.;!?\n]/).map((p) => p.trim()).filter(Boolean);
  let shortText = parts.length > 0 ? parts[0] : text;
  if (shortText.length > 64) {
    shortText = `${shortText.slice(0, 61).trim()}...`;
  }
  return shortText;
}

const toastOptions = {
  hideProgressBar: true,
  closeButton: true,
};

export const showToast = {
  success(content) {
    const message = compactToastMessage(content) || String(content);
    return toast.success(message, toastOptions);
  },
  error(content) {
    const message = compactToastMessage(content) || String(content);
    return toast.error(message, toastOptions);
  },
  info(content) {
    const message = compactToastMessage(content) || String(content);
    return toast.info(message, toastOptions);
  },
};
