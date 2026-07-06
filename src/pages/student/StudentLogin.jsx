import logoImg from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useApp } from '../../context/AppContext';
import { loginStudent } from '../../api/studentApi';
import { getRoleFromToken, normalizePhone, normalizeRole } from '../../utils/authUtils';

export default function StudentLogin() {
  const { dark, toggleDark, lang, toggleLang, t } = useApp();
  const [input, setInput] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  async function Submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedPhone = normalizePhone(input.phone);
      const res = await loginStudent(normalizedPhone, input.password.trim());
      const data = res.data;
      const role = normalizeRole(data.role) || getRoleFromToken(data.accessToken);

      // Role tekshirish — faqat STUDENT kirishi mumkin
      if (role !== 'STUDENT') {
        setError(
          lang === 'uz'
            ? "Bu sahifa faqat studentlar uchun. Admin paneldan foydalaning."
            : "Эта страница только для студентов. Используйте панель администратора."
        );
        setLoading(false);
        return;
      }

      // Token va user ma'lumotlarini saqlash
      sessionStorage.setItem('studentToken', data.accessToken);
      sessionStorage.setItem('studentRefreshToken', data.refreshToken);
      sessionStorage.setItem('studentUser', JSON.stringify({
        full_name: data.full_name || data.name || 'Student',
        phone: normalizedPhone,
        email: data.email || '',
        role: role || 'STUDENT',
        id: data.id,
      }));

      setShowToast(true);
      setTimeout(() => navigate('/student/dashboard', { replace: true }), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        setError(
          lang === 'uz'
            ? "Telefon raqam yoki parol noto'g'ri"
            : "Неверный телефон или пароль"
        );
      } else {
        setError(msg || (lang === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка"));
      }
    } finally {
      setLoading(false);
    }
  }

  function InputData(e) {
    setError('');
    setInput(cur => ({ ...cur, [e.target.id]: e.target.value }));
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: dark ? '#0a0a0f' : '#f8fafc' }}>
      {showToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 99999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', background: '#f0fdf4',
          border: '1.5px solid #bbf7d0', borderRadius: 14,
          boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
          animation: 'slideIn 0.3s ease', minWidth: 240,
        }}>
          <CheckCircleRoundedIcon style={{ color: '#22c55e', fontSize: 22, flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803d', flex: 1 }}>
            {lang === 'uz' ? 'Muvaffaqiyatli kirildi' : 'Успешный вход'}
          </span>
          <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86efac', display: 'flex' }}>
            <CloseRoundedIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* LEFT */}
      <div className="hidden lg:flex" style={{
        width: '50%', background: dark ? '#10172f' : '#203463',
        alignItems: 'center', justifyContent: 'center',
        padding: '64px 56px', minHeight: '100vh', overflow: 'hidden',
      }}>
        <img src="/login.img.png" alt="study" style={{ width: 'min(82%, 760px)', maxHeight: '78vh', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* RIGHT */}
      <div style={{
        width: '50%', flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '56px 24px 28px', background: dark ? '#111118' : '#f8fafc',
        overflowY: 'auto', position: 'relative', minWidth: 0,
      }}>
        {/* Til + Dark */}
        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
          <button onClick={toggleLang} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: 1, background: dark ? '#1a1a28' : '#f1f3f9',
            color: dark ? '#a0a0c0' : '#6c35de',
            border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {lang === 'uz' ? 'RU' : 'UZ'}
          </button>
          <button onClick={toggleDark} style={{
            width: 34, height: 34, borderRadius: 8,
            background: dark ? '#1a1a28' : '#f1f3f9',
            border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', transition: 'all 0.2s',
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: 440, padding: '0 4px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{
                fontSize: '0.8rem', fontWeight: 700, color: dark ? '#b8c4ff' : '#0b245c',
                textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.7, marginBottom: 16,
              }}>
                Muhammad al-Xorazmiy nomidagi<br />
                Toshkent Axborot Texnologiyalari<br />
                Universiteti
              </h1>
              <img src={logoImg} alt="logo" style={{ height: 72, width: 'auto', objectFit: 'contain', marginBottom: 14 }} />
              <h2 style={{
                fontSize: '1.25rem', fontWeight: 800, color: dark ? '#dbe4ff' : '#0b245c',
                letterSpacing: '0.5px', margin: 0,
              }}>
                Najot Edu — Student
              </h2>
            </div>

            <form onSubmit={Submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Collapse in={!!error}>
                <Alert severity="error" sx={{ fontSize: '0.82rem', borderRadius: '10px', fontFamily: 'inherit', mb: 0.5 }}>
                  {error}
                </Alert>
              </Collapse>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="phone" style={{ fontSize: '0.82rem', fontWeight: 600, color: dark ? '#8888aa' : '#475569' }}>
                  {lang === 'uz' ? 'Telefon raqam' : 'Номер телефона'}
                </label>
                <input
                  onChange={InputData}
                  id="phone"
                  type="text"
                  placeholder={lang === 'uz' ? 'Telefon raqamingizni kiriting' : 'Введите номер телефона'}
                  required
                  style={{
                    height: 48, padding: '0 16px', borderRadius: 8,
                    border: `1px solid ${dark ? '#2a2a3a' : '#d7e0ef'}`,
                    background: dark ? '#16161f' : '#e9f1ff',
                    color: dark ? '#f0f0f5' : '#1e293b', fontSize: '1rem',
                    outline: 'none', transition: 'border-color 0.2s', width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6c35de'}
                  onBlur={e => e.target.style.borderColor = dark ? '#2a2a3a' : '#d7e0ef'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: '0.82rem', fontWeight: 600, color: dark ? '#8888aa' : '#475569' }}>
                  {t.passwordLabel}
                </label>
                <input
                  onChange={InputData}
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  required
                  style={{
                    height: 48, padding: '0 16px', borderRadius: 8,
                    border: `1px solid ${dark ? '#2a2a3a' : '#d7e0ef'}`,
                    background: dark ? '#16161f' : '#e9f1ff',
                    color: dark ? '#f0f0f5' : '#1e293b', fontSize: '0.9rem',
                    outline: 'none', transition: 'border-color 0.2s', width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6c35de'}
                  onBlur={e => e.target.style.borderColor = dark ? '#2a2a3a' : '#d7e0ef'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 48, borderRadius: 8, background: loading ? '#64748b' : '#243363',
                  color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.18)',
                  transition: 'all 0.2s', letterSpacing: '0.3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseOver={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.24)'; }}}
                onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.18)'; }}
              >
                {loading && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                {loading ? (lang === 'uz' ? 'Kirilmoqda...' : 'Вход...') : t.loginBtn}
              </button>
            </form>
          </div>
        </div>

        <p style={{ fontSize: '0.72rem', color: dark ? '#3a3a55' : '#94a3b8', textAlign: 'center', marginTop: 16 }}>
          {t.copyright}
        </p>
      </div>
    </div>
  );
}
