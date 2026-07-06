import { Navigate } from "react-router-dom";
import { getRoleBasedRoute, getRoleFromStoredUser, getRoleFromToken, clearAllSessions } from "../../utils/authUtils";

/**
 * GuestRoute — Faqat tizimga kirmagan foydalanuvchilar uchun.
 * Token mavjud bo'lsa, rolga qarab to'g'ri panelga yo'naltiradi.
 */
export default function GuestRoute({ children }) {
  const studentToken = sessionStorage.getItem('studentToken');
  const accessToken  = sessionStorage.getItem('accessToken');

  // 1. Student token bo'lsa — student panelga
  if (studentToken) {
    return <Navigate to='/student' replace />;
  }

  // 2. Admin/Teacher token bo'lsa — role'ni o'qib to'g'ri panelga
  if (accessToken) {
    const role = getRoleFromToken(accessToken) || getRoleFromStoredUser('currentUser');

    // Role o'qib bo'lmasa yoki noto'g'ri bo'lsa — sessionni tozalab login sahifasida qoldir
    if (!role) {
      clearAllSessions();
      return children;
    }

    const route = getRoleBasedRoute(role);
    return <Navigate to={route} replace />;
  }

  // 3. Token yo'q — login sahifasini ko'rsat
  return children;
}
