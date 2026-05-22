const ROLE_ADMIN = "admin";
const ROLE_MANAGER = "manager";
const ROLE_STAFF = "staff";

const pageMatrix = {
  dashboard: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  analytic: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  product: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  order: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  user: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  staff: [ROLE_ADMIN, ROLE_MANAGER],
  discount: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  category: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  reviews: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
};

export const normalizeAdminRole = (role) =>
  String(role || ROLE_ADMIN).toLowerCase();

export const canAccessAdminPage = (role, pageKey) => {
  const r = normalizeAdminRole(role);
  const allow = pageMatrix[pageKey] || [ROLE_ADMIN];
  return allow.includes(r);
};

export const adminMenuEntries = [
  { key: "dashboard", label: "Dashboard" },
  { key: "analytic", label: "Analytics" },
  { key: "product", label: "Products" },
  { key: "order", label: "Orders" },
  { key: "user", label: "Customers" },
  { key: "staff", label: "Staff" },
  { key: "category", label: "Categories" },
  { key: "reviews", label: "Reviews" },
  { key: "discount", label: "Discounts" },
];
