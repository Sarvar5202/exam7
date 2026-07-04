import { Navigate } from "react-router-dom";

export default function StudentGuestRoute({ children }) {
  const token = sessionStorage.getItem('studentToken');
  if (token) return <Navigate to='/student/dashboard' replace />;
  return children;
}
