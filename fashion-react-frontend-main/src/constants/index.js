/** Category slugs — match `product.category` and seeded categories */
export const categoryList = [
  { value: "ao-nam", label: "Men's tops" },
  { value: "quan-nam", label: "Men's pants" },
  { value: "vay", label: "Dresses" },
  { value: "thoi-trang-nu", label: "Women's fashion" },
  { value: "giay-tui", label: "Shoes & bags" },
  { value: "phu-kien", label: "Accessories" },
];

export const categoryListAdmin = [
  { value: "all", label: "All" },
  ...categoryList,
];

export const companyList = [
  { value: "local", label: "Local brand" },
  { value: "zara", label: "Zara" },
  { value: "uniqlo", label: "Uniqlo" },
  { value: "h&m", label: "H&M" },
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
];

export const companyListAdmin = [{ value: "all", label: "All" }, ...companyList];

export const legacyCategoryLabels = {
  office: "Office (legacy)",
  "living room": "Living room (legacy)",
  kitchen: "Kitchen (legacy)",
  bedroom: "Bedroom (legacy)",
  dining: "Dining (legacy)",
  kids: "Kids (legacy)",
};

export const labelForCategory = (slug) => {
  if (slug == null || slug === "") return "—";
  const key = String(slug).trim();
  const keyLower = key.toLowerCase();
  const fromList = categoryList.find(
    (c) => c.value === key || c.value === keyLower
  )?.label;
  if (fromList) return fromList;
  const legacy =
    legacyCategoryLabels[keyLower] ?? legacyCategoryLabels[key];
  if (legacy) return legacy;
  return key;
};

export const labelForBrand = (value) =>
  companyList.find((c) => c.value === value)?.label ?? value ?? "—";

export const storefrontFilterCopy = {
  searchPlaceholder: "Search",
  category: "Category",
  brand: "Brand",
  colors: "Color",
  price: "Max price",
  all: "All",
  clearFilters: "Clear filters",
};

export const colorsList = [
  { label: "Red", value: "#FF0000" },
  { label: "Green", value: "#00ff00" },
  { label: "Blue", value: "#0000FF" },
  { label: "Black", value: "#000000" },
  { label: "Yellow", value: "#FFB900" },
  { label: "White", value: "#ffffff" },
  { label: "Gray", value: "#9E9E9E" },
  { label: "Brown-Beige", value: "#A67C52" },
  { label: "Beige", value: "#E8D4B8" },
  { label: "Purple", value: "#6B2D5C" },
  {
    label: "Earth Brown",
    value: "#5C4033",
  },
  {
    label: "Moss Green",
    value: "#4A5D4A",
  },
  {
    label: "Terracotta",
    value: "#C27B4A",
  },
  {
    label: "Pastel Pink",
    value: "#F4C2C2",
  },
  {
    label: "Pastel Mint",
    value: "#B2F0D4",
  },
  {
    label: "Pastel Lavender",
    value: "#D4B5D4",
  },
];

/** Product storefront lifecycle — matches backend `Product.status` */
export const productStatusFormOptions = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "draft",
    label: "Draft",
  },
];

export const enumStatus = [
  { value: "pending", label: "Pending", color: "purple" },
  { value: "confirmed", label: "Confirmed", color: "orange" },
  { value: "shipping", label: "Shipping", color: "blue" },
  { value: "delivered", label: "Delivered", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
];

const opt = (value, label, disabled = false) => ({ value, label, disabled });

export const enumStatusAdmin = (current) => {
  switch (current) {
    case "pending":
      return [
        opt("pending", "Pending"),
        opt("confirmed", "Confirmed"),
        opt("cancelled", "Cancelled"),
      ];
    case "confirmed":
      return [
        opt("confirmed", "Confirmed"),
        opt("shipping", "Shipping"),
        opt("cancelled", "Cancelled"),
      ];
    case "shipping":
      return [
        opt("shipping", "Shipping"),
        opt("delivered", "Delivered"),
      ];
    case "delivered":
      return [opt("delivered", "Delivered", true)];
    case "cancelled":
      return [opt("cancelled", "Cancelled", true)];
    default:
      return enumStatus.map((s) => opt(s.value, s.label));
  }
};

export const enumPaymentStatus = [
  { value: "01", label: "Unpaid", color: "red" },
  { value: "02", label: "Paid", color: "green" },
];
