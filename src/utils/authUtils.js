/**
 * Auth Utility — Markazlashtirilgan role logikasi
 * Barcha panellar (GuestRoute, Login, ProtectRoute) shu joydan import qiladi.
 */

/**
 * Backend'dan kelishi mumkin bo'lgan barcha formatlarni yagona formatga keltiradi:
 * "SUPER_ADMIN", "super_admin", "SuperAdmin", "superadmin" → "SUPERADMIN"
 * "ADMIN", "admin" → "ADMIN"
 * "TEACHER", "teacher" → "TEACHER"
 * "STUDENT", "student" → "STUDENT"
 */
export function normalizeRole(role) {
  if (!role) return '';
  return String(role).toUpperCase().replace(/[-_\s]/g, '');
}

/**
 * Role asosida qaysi route'ga yo'naltirish kerakligini aniqlaydi.
 * Kelajakda yangi rol qo'shilsa — faqat shu funksiyani yangilash kifoya.
 */
export function getRoleBasedRoute(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'SUPERADMIN':
    case 'ADMIN':
      return '/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student';
    default:
      return '/dashboard';
  }
}

/**
 * Login qilishdan oldin barcha eski sessiya ma'lumotlarini tozalash.
 * Bu eski rol keshlangan holda noto'g'ri panelga tushib qolishni oldini oladi.
 */
export function clearAllSessions() {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('studentToken');
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('studentUser');
  sessionStorage.removeItem('studentRefreshToken');
}

/**
 * JWT token'dan role'ni xavfsiz o'qib, normallashtirilgan holda qaytaradi.
 * Xato bo'lsa '' qaytaradi.
 */
export function getRoleFromToken(token) {
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const raw = payload.role || payload.roles?.[0] || '';
    return normalizeRole(raw);
  } catch {
    return '';
  }
}
