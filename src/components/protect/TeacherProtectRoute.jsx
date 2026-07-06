import { Navigate } from "react-router-dom";
import { getRoleFromStoredUser, getRoleFromToken } from "../../utils/authUtils";

export default function TeacherProtectRoute({ children }) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return <Navigate to='/login' replace />;

  try {
    const role = getRoleFromToken(token) || getRoleFromStoredUser('currentUser');
    if (role !== 'TEACHER') {
      return <Navigate to='/login' replace />;
    }
  } catch {
    return <Navigate to='/login' replace />;
  }
  return children;
}
