import { Navigate } from "react-router-dom";

export default function StudentProtectRoute({ children }) {
  const token = sessionStorage.getItem('studentToken');
  if (!token) return <Navigate to='/login' replace />;
  return children;
}

