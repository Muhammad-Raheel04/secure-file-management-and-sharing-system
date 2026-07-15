import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectRoute = ({ children }) => {
  const { user } = useSelector((store) => store.user);
  const location = useLocation();

  const token = localStorage.getItem("accessToken");

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectRoute;