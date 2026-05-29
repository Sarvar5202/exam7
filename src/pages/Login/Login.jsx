import logoImg from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function Login() {
  const { dark, toggleDark, lang, toggleLang, t } = useApp();
  const [input, setInput] = useState({ phone: '', password: '' });
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  function Submit(e) {
    e.preventDefault();
    api.post('/auth/login', input).then(res => {
      if (res.status === 201) {
        const auth = res.data?.accessToken;
        if (auth) {
          sessionStorage.setItem("accessToken", auth);

          // API faqat accessToken qaytaradi — qo'shimcha ma'lumotlarni
          // response dan yoki token payload dan olamiz
          const user = res.data?.user || res.data?.admin || res.data?.data || null;
          if (user && Object.keys(user).length > 0) {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
          } else {
            // Token payload (JWT) dan decode qilish
            try {
              const payload = JSON.parse(atob(auth.split('.')[1]));
              const userData = {
                full_name: payload.full_name || payload.name || payload.username || "",
                first_name: payload.first_name || "",
                last_name: payload.last_name || "",
                phone: payload.phone || input.phone || "",
                role: payload.role || payload.roles?.[0] || "ADMIN",
              };
              sessionStorage.setItem("currentUser", JSON.stringify(userData));
            } catch {
              // decode ishlamasa — phone ni saqlaymiz
              sessionStorage.setItem("currentUser", JSON.stringify({ phone: input.phone, role: "ADMIN" }));
            }
          }

          setSuccess(true);
          setShowToast(true);
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        } else { setError(true); }
      } else { setError(true); }
    }).catch(() => setError(true));
  }

  function InputData(e) {
    setError(false);
    setSuccess(false);
    setInput(cur => ({ ...cur, [e.target.id]: e.target.value }));
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: dark ? '#0a0a0f' : '#eef0f5' }}>

      {/* Muvaffaqiyatli kirish toast — o'ng yuqori */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
          animation: 'slideIn 0.3s ease',
          minWidth: 240,
        }}>
          <CheckCircleRoundedIcon style={{ color: '#22c55e', fontSize: 22, flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803d', flex: 1 }}>
            Muvaffaqiyatli kirildi
          </span>
          <button
            onClick={() => setShowToast(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86efac', display: 'flex' }}
          >
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

      {/* LEFT — ko'k panel, rasm */}
      <div style={{
        flex: 1,
        background: dark
          ? 'linear-gradient(160deg, #0d0d1a 0%, #12102a 100%)'
          : 'linear-gradient(160deg, #1a2a4a 0%, #1e3a6a 100%)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }} className="lg:flex">
        <img src="/study.svg" alt="study" style={{ maxWidth: 380, width: '100%' }} />
      </div>

      {/* RIGHT — forma */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 24px',
        background: dark ? '#111118' : '#ffffff',
        overflowY: 'auto',
        position: 'relative',
        minWidth: 0,
      }}>

        {/* Til + Dark tugmalar */}
        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
          {/* Til */}
          <button
            onClick={toggleLang}
            style={{
              padding: '5px 14px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: 1,
              background: dark ? '#1a1a28' : '#f1f3f9',
              color: dark ? '#a0a0c0' : '#6c35de',
              border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {lang === 'uz' ? 'RU' : 'UZ'}
          </button>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: dark ? '#1a1a28' : '#f1f3f9',
              border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Markaziy kontent */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: 360, padding: '0 4px' }}>

            {/* Logo + sarlavha */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: dark ? '#6060a0' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1.7,
                marginBottom: 16,
              }}>
                Muhammad al-Xorazmiy nomidagi<br />
                Toshkent Axborot Texnologiyalari<br />
                Universiteti
              </h1>

              <img
                src={logoImg}
                alt="logo"
                style={{ height: 72, width: 'auto', objectFit: 'contain', marginBottom: 14 }}
              />

              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: dark ? '#8866ff' : '#6c35de',
                letterSpacing: '0.5px',
                margin: 0,
              }}>
                Najot CRM
              </h2>
            </div>

            {/* Forma */}
            <form onSubmit={Submit} className={error ? 'shake' : ''} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Collapse in={error}>
                <Alert severity="error" sx={{ fontSize: '0.82rem', borderRadius: '10px', fontFamily: 'inherit', mb: 0.5 }}>
                  {t.loginError}
                </Alert>
              </Collapse>

              {/* Login input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label
                  htmlFor="phone"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: dark ? '#8888aa' : '#475569' }}
                >
                  {t.loginLabel}
                </label>
                <input
                  onChange={InputData}
                  id="phone"
                  type="text"
                  inputMode="numeric"
                  placeholder={t.loginPlaceholder}
                  required
                  style={{
                    height: 48,
                    padding: '0 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
                    background: dark ? '#16161f' : '#f8fafc',
                    color: dark ? '#f0f0f5' : '#1e293b',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6c35de'}
                  onBlur={e => e.target.style.borderColor = dark ? '#2a2a3a' : '#e2e8f0'}
                />
              </div>

              {/* Parol input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: dark ? '#8888aa' : '#475569' }}
                >
                  {t.passwordLabel}
                </label>
                <input
                  onChange={InputData}
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  required
                  style={{
                    height: 46,
                    padding: '0 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${dark ? '#2a2a3a' : '#e2e8f0'}`,
                    background: dark ? '#16161f' : '#f8fafc',
                    color: dark ? '#f0f0f5' : '#1e293b',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = dark ? '#6c35de' : '#6c35de'}
                  onBlur={e => e.target.style.borderColor = dark ? '#2a2a3a' : '#e2e8f0'}
                />
              </div>

              {/* Kirish tugma */}
              <button
                type="submit"
                style={{
                  height: 48,
                  borderRadius: 12,
                  background: dark
                    ? 'linear-gradient(135deg, #5a28c0 0%, #7a40e8 100%)'
                    : 'linear-gradient(135deg, #6c35de 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: 4,
                  boxShadow: dark
                    ? '0 4px 20px rgba(108,53,222,0.35)'
                    : '0 4px 20px rgba(108,53,222,0.25)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.3px',
                }}
                onMouseOver={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 24px rgba(108,53,222,0.45)'; }}
                onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = dark ? '0 4px 20px rgba(108,53,222,0.35)' : '0 4px 20px rgba(108,53,222,0.25)'; }}
              >
                {t.loginBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: '0.72rem', color: dark ? '#3a3a55' : '#94a3b8', textAlign: 'center', marginTop: 16 }}>
          {t.copyright}
        </p>
      </div>
    </div>
  );
}
