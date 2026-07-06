import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { normalizeRole, getRoleBasedRoute, clearAllSessions, normalizePhone, getRoleFromToken } from '../../utils/authUtils';

const PRIMARY_DARK = '#1E2A4A';

export default function Login() {
  const { lang, t } = useApp();
  const [input, setInput] = useState({ phone: '', password: '' });
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  function Submit(e) {
    e.preventDefault();

    const normalizedPhone = normalizePhone(input.phone);
    const payload = { ...input, phone: normalizedPhone, password: input.password.trim() };

    api.post('/auth/login', payload).then(res => {
      if (res.status === 201) {
        const auth = res.data?.accessToken;
        const rawRole = res.data?.role;

        if (auth) {
          const tokenRole = getRoleFromToken(auth);
          const normalized = normalizeRole(rawRole) || tokenRole;
          const targetRoute = getRoleBasedRoute(normalized);

          // ── Yangi login oldidan eski sessiyalarni TOZALASH ──
          clearAllSessions();

          if (normalized === 'STUDENT') {
            // Student uchun studentToken saqlaymiz
            sessionStorage.setItem('studentToken', auth);
            try {
              const tokenPayload = JSON.parse(atob(auth.split('.')[1]));
              sessionStorage.setItem('studentUser', JSON.stringify({
                full_name: tokenPayload.full_name || tokenPayload.name || '',
                phone: tokenPayload.phone || normalizedPhone || '',
                role: 'STUDENT',
              }));
            } catch {
              sessionStorage.setItem('studentUser', JSON.stringify({ phone: normalizedPhone, role: 'STUDENT' }));
            }
            setSuccess(true);
            setShowToast(true);
            setTimeout(() => navigate(targetRoute, { replace: true }), 1200);
          } else {
            // SUPERADMIN / ADMIN / TEACHER
            sessionStorage.setItem('accessToken', auth);
            const user = res.data?.user || res.data?.admin || res.data?.data || null;
            if (user && typeof user === 'object' && Object.keys(user).length > 0) {
              // user objectga role'ni ham qo'shamiz (agar ichida yo'q bo'lsa)
              const userWithRole = { ...user, role: user.role || rawRole || normalized };
              sessionStorage.setItem('currentUser', JSON.stringify(userWithRole));
            } else {
              try {
                const tokenPayload = JSON.parse(atob(auth.split('.')[1]));
                sessionStorage.setItem('currentUser', JSON.stringify({
                  full_name: tokenPayload.full_name || tokenPayload.name || tokenPayload.username || '',
                  phone: tokenPayload.phone || normalizedPhone || '',
                  role: rawRole || tokenPayload.role || 'ADMIN',
                }));
              } catch {
                sessionStorage.setItem('currentUser', JSON.stringify({ phone: normalizedPhone, role: rawRole || 'ADMIN' }));
              }
            }
            setSuccess(true);
            setShowToast(true);
            setTimeout(() => navigate(targetRoute, { replace: true }), 1200);
          }
        } else { setError(true); }
      } else { setError(true); }
    }).catch(() => setError(true));
  }

  function InputData(e) {
    setError(false);
    setSuccess(false);
    setInput(cur => ({ ...cur, [e.target.id]: e.target.value }));
  }

  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @keyframes loginSlideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .login-shake { animation: loginShake 0.5s ease; }

        .login-page {
          --primary-dark: ${PRIMARY_DARK};
          display: flex;
          min-height: 100vh;
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* LEFT PANEL */
        .login-left {
          width: 47%;
          min-height: 100vh;
          background: var(--primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
        }
        .login-left img {
          width: min(85%, 600px);
          max-height: 80vh;
          object-fit: contain;
          display: block;
        }

        /* RIGHT PANEL */
        .login-right {
          width: 53%;
          flex: 1;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 2rem 1.5rem 1.5rem;
          overflow-y: auto;
        }

        /* LOGO SECTION */
        .login-logo-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .login-logo-section img {
          height: 9rem;
          width: auto;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }

        /* FORM */
        .login-form-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .login-form-container {
          width: 100%;
          max-width: 22rem;
          padding: 0 0.25rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .login-input-group {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .login-input {
          height: 3rem;
          padding: 0 1rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #1e293b;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .login-input::placeholder {
          color: #9ca3af;
          font-size: 0.9rem;
        }
        .login-input:focus {
          border-color: var(--primary-dark);
          box-shadow: 0 0 0 3px rgba(30, 42, 74, 0.08);
        }

        /* BUTTON */
        .login-btn {
          height: 3rem;
          border-radius: 0.5rem;
          background: var(--primary-dark);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
          font-family: inherit;
          width: 100%;
        }
        .login-btn:hover {
          background: #162040;
          box-shadow: 0 4px 14px rgba(30, 42, 74, 0.25);
        }
        .login-btn:active {
          transform: scale(0.98);
        }

        /* COPYRIGHT */
        .login-copyright {
          text-align: center;
          padding-top: 1rem;
        }
        .login-copyright p {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .login-left {
            display: none;
          }
          .login-right {
            width: 100%;
            padding: 2rem 1.5rem 1.5rem;
          }
          .login-logo-section img {
            height: 7rem;
          }
          .login-form-container {
            max-width: 100%;
            padding: 0 1rem;
          }
        }
      `}</style>

      <div className="login-page">

        {/* Success toast — o'ng yuqori */}
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
            animation: 'loginSlideIn 0.3s ease',
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

        {/* LEFT PANEL — dark navy + illustration */}
        <div className="login-left">
          <img
            src="/login.img.png"
            alt="Study illustration"
            draggable={false}
          />
        </div>

        {/* RIGHT PANEL — logo + form + copyright */}
        <div className="login-right">

          {/* Center content vertically */}
          <div className="login-form-wrapper">
            <div className="login-form-container">

              {/* Logo */}
              <div className="login-logo-section">
                <img
                  src="/login.img.png"
                  alt="NajotEdu CRM"
                  draggable={false}
                />
              </div>

              {/* Form */}
              <form
                onSubmit={Submit}
                className={`login-form ${error ? 'login-shake' : ''}`}
              >
                <Collapse in={error}>
                  <Alert
                    severity="error"
                    sx={{
                      fontSize: '0.82rem',
                      borderRadius: '0.5rem',
                      fontFamily: 'inherit',
                      mb: 0.5,
                    }}
                  >
                    {t.loginError}
                  </Alert>
                </Collapse>

                {/* Login input */}
                <div className="login-input-group">
                  <input
                    onChange={InputData}
                    id="phone"
                    type="text"
                    inputMode="numeric"
                    placeholder={t.loginLabel}
                    required
                    className="login-input"
                  />
                </div>

                {/* Password input */}
                <div className="login-input-group" style={{ position: 'relative' }}>
                  <input
                    onChange={InputData}
                    id="password"
                    type="password"
                    placeholder={t.passwordLabel}
                    required
                    className="login-input"
                  />
                  {/* Forgot Password Link */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <span
                      onClick={() => navigate('/forgot-password')}
                      style={{
                        fontSize: '0.8rem',
                        color: PRIMARY_DARK,
                        cursor: 'pointer',
                        fontWeight: 600,
                        userSelect: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      Parolni unutdingizmi?
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button type="submit" className="login-btn">
                  {t.loginBtn}
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="login-copyright">
            <p>Copyright © {currentYear} NajotEdu CRM</p>
          </div>
        </div>
      </div>
    </>
  );
}
