import { useContext } from "react";
import { authContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(authContext);
  const accessibleRoute = token ? (
    children
  ) : (
    <Navigate to={"/login"} replace={true} />
  );
  return accessibleRoute;
};

export default ProtectedRoute;
