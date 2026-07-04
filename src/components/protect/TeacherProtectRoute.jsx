import { Navigate } from "react-router-dom";

export default function TeacherProtectRoute({ children }) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return <Navigate to='/login' replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || payload.roles?.[0] || '').toUpperCase().replace(/[-_\s]/g, '');
    if (role !== 'TEACHER') {
      return <Navigate to='/login' replace />;
    }
  } catch {
    return <Navigate to='/login' replace />;
  }
  return children;
}
