const ROLE_ADMIN = "admin";
const ROLE_MANAGER = "manager";
const ROLE_STAFF = "staff";

const pageMatrix = {
  dashboard: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  analytic: [ROLE_ADMIN, ROLE_MANAGER],
  product: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  order: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  user: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  staff: [ROLE_ADMIN],
  discount: [ROLE_ADMIN, ROLE_MANAGER],
  category: [ROLE_ADMIN, ROLE_MANAGER],
  reviews: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
};

export const normalizeAdminRole = (role) =>
  String(role || ROLE_STAFF).toLowerCase();

export const canAccessAdminPage = (role, pageKey) => {
  const r = normalizeAdminRole(role);
  const allow = pageMatrix[pageKey] || [ROLE_ADMIN];
  return allow.includes(r);
};

export const canWriteAdminData = (role) => {
  const r = normalizeAdminRole(role);
  return r === ROLE_ADMIN || r === ROLE_MANAGER;
};

export const canManageStaff = (role) => normalizeAdminRole(role) === ROLE_ADMIN;

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
