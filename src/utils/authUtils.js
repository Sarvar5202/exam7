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
 * Backend uchun raqamni yagona formatga keltiradi.
 * Masalan: 975661099 -> +998975661099, 998975661099 -> +998975661099.
 */
export function normalizePhone(phone) {
  if (!phone) return '';

  const digits = String(phone).trim().replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 9) {
    return `+998${digits}`;
  }

  return `+${digits}`;
}

/**
 * JWT token'dan role'ni xavfsiz o'qib, normallashtirilgan holda qaytaradi.
 * Xato bo'lsa '' qaytaradi.
 */
export function getRoleFromToken(token) {
  if (!token) return '';
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return '';

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    const raw = payload.role || payload.roles?.[0] || payload.authorities?.[0] || '';
    return normalizeRole(raw);
  } catch {
    return '';
  }
}

export function getRoleFromStoredUser(storageKey) {
  try {
    const user = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    return normalizeRole(user.role || user.roles?.[0] || '');
  } catch {
    return '';
  }
}
