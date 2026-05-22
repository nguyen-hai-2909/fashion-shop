import { Navigate } from "react-router-dom";

const NotExistedPage = () => {
  return <Navigate to="/" replace={true} />;
};

export default NotExistedPage;
