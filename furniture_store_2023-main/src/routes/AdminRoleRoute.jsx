import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { adminContext } from "../context/AdminContext";
import { canAccessAdminPage } from "../utils/adminPermission";

const AdminRoleRoute = ({ pageKey, children }) => {
  const { admin } = useContext(adminContext);
  if (!canAccessAdminPage(admin?.role, pageKey)) {
    return <Navigate to="/admin/dashboard" replace={true} />;
  }
  return children;
};

export default AdminRoleRoute;
