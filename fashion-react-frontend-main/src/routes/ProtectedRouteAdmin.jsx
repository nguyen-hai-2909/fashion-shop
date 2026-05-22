import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { adminContext } from "../context/AdminContext";

const ProtectedRouteAdmin = ({ children }) => {
  const { tokenAdmin } = useContext(adminContext);
  const accessibleRoute = tokenAdmin ? (
    children
  ) : (
    <Navigate to={"/admin/login"} replace={true} />
  );
  return accessibleRoute;
};

export default ProtectedRouteAdmin;
