import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const token = sessionStorage.getItem('accessToken');
  if (token) return <Navigate to='/dashboard' replace />;
  return children;
}
