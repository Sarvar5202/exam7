import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

const PRIMARY_DARK = '#1E2A4A';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Password, 4: Success
  const [phone, setPhone] = useState('');
  const [otpCells, setOtpCells] = useState(['', '', '', '']); // 4 discrete cells
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerifiedTime, setOtpVerifiedTime] = useState(null);
  
  // Shake / error visual feedbacks
  const [otpShake, setOtpShake] = useState(false);
  const [otpError, setOtpError] = useState(false); // Persistent error state for red borders
  const [slideDirection, setSlideDirection] = useState('enter'); // for view transitions

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for code resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(p => p - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Autoplay redirection back to login at step 4
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        handleFinalRedirect();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  function handleFinalRedirect() {
    navigate('/login', { replace: true });
    // Autofill phone number in login page
    setTimeout(() => {
      const loginPhoneInput = document.getElementById('phone');
      if (loginPhoneInput) {
        loginPhoneInput.value = phone;
        // dispatch custom event to update react state if active
        loginPhoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  }

  // OTP inputs auto-focus logic
  const handleOtpChange = (index, value) => {
    // Clear error message when user starts typing again (visual feedback reset)
    if (error) setError('');
    if (otpError) setOtpError(false); // Clear red border error state when user starts typing
    
    const val = value.replace(/\D/g, ''); // numbers only
    if (!val) {
      const newCells = [...otpCells];
      newCells[index] = '';
      setOtpCells(newCells);
      return;
    }

    const newCells = [...otpCells];
    newCells[index] = val[0];
    setOtpCells(newCells);

    // Auto-focus next cell
    if (index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      // Clear error message when user starts editing (visual feedback reset)
      if (error) setError('');
      if (otpError) setOtpError(false); // Clear red border when user edits
      
      if (!otpCells[index] && index > 0) {
        const newCells = [...otpCells];
        newCells[index - 1] = '';
        setOtpCells(newCells);
        otpRefs[index - 1].current.focus();
      } else {
        const newCells = [...otpCells];
        newCells[index] = '';
        setOtpCells(newCells);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const newCells = [...otpCells];
    for (let i = 0; i < 4; i++) {
      if (pastedData[i]) {
        newCells[i] = pastedData[i];
      }
    }
    setOtpCells(newCells);
    const focusIndex = Math.min(pastedData.length, 3);
    otpRefs[focusIndex].current.focus();
  };

  // Password strength analyzer
  const getPasswordStrength = () => {
    if (!newPass) return { score: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (newPass.length >= 6) score += 1;
    if (/[A-Z]/.test(newPass)) score += 1;
    if (/[0-9]/.test(newPass)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Kuchsiz', color: '#ef4444' };
    if (score === 2) return { score: 50, label: "O'rtacha", color: '#eab308' };
    if (score === 3) return { score: 75, label: "Kuchli", color: '#22c55e' };
    return { score: 100, label: "Juda kuchli ✨", color: '#10b981' };
  };

  const strength = getPasswordStrength();

  // Transitions step switcher
  const goToStep = (nextStep) => {
    setSlideDirection('leave');
    setTimeout(() => {
      setStep(nextStep);
      setSlideDirection('enter');
    }, 200);
  };

  // STEP 1 Action: Request OTP
  const submitPhone = (e) => {
    e.preventDefault();
    if (!phone) return setError("Telefon raqamini kiriting");

    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('998') && cleanPhone.length === 9) {
      cleanPhone = '998' + cleanPhone;
    }
    if (cleanPhone.length !== 12) {
      return setError("Telefon raqami noto'g'ri (namuna: +998901234567)");
    }
    const formattedPhone = '+' + cleanPhone;

    setLoading(true);
    setError('');

    api.post('/auth/send-otp', { phone: formattedPhone })
      .then(() => {
        setPhone(formattedPhone);
        setResendTimer(60);
        setLoading(false);
        goToStep(2);
      })
      .catch(err => {
        setError(err.response?.data?.message || "OTP yuborishda xatolik yuz berdi");
        setLoading(false);
      });
  };

  // STEP 2 Action: Verify OTP
  const submitOtp = (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpCells.join('');
    if (fullOtp.length !== 4) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 500);
      return setError("Tasdiqlash kodini to'liq kiriting");
    }

    setLoading(true);
    setError('');

    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('998') && cleanPhone.length === 9) {
      cleanPhone = '998' + cleanPhone;
    }
    const formattedPhone = '+' + cleanPhone;

    api.post('/auth/verify-otp', { phone: formattedPhone, otp: fullOtp })
      .then((response) => {
        // SUCCESS: OTP is correct - proceed to next stage
        setOtpVerifiedTime(Date.now());
        setLoading(false);
        goToStep(3);
      })
      .catch(err => {
        // ERROR: OTP is incorrect or expired
        // 1. Trigger shake animation
        setOtpShake(true);
        setTimeout(() => setOtpShake(false), 500);
        
        // 2. Set persistent error state for red borders (stays until user types new code)
        setOtpError(true);
        
        // 3. Show error message
        setError(err.response?.data?.message || "Kiritilgan kod noto'g'ri. Qaytadan urinib ko'ring.");
        
        // 4. Auto-clear all OTP cells after shake animation completes
        setTimeout(() => {
          setOtpCells(['', '', '', '']);
          // 5. Return focus to first cell
          otpRefs[0].current?.focus();
        }, 500);
        
        setLoading(false);
        // IMPORTANT: Do NOT call goToStep(3) here - user stays on stage 2
      });
  };

  // STEP 3 Action: Apply Change
  const submitNewPassword = (e) => {
    e.preventDefault();
    if (!newPass || !confirmPass) {
      return setError("Parollarni to'liq kiriting");
    }
    if (newPass !== confirmPass) {
      return setError("Kiritilgan parollar mos kelmadi");
    }
    if (newPass.length < 4) {
      return setError("Parol uzunligi kamida 4 ta belgidan iborat bo'lishi kerak");
    }

    // Security verify - OTP 10 min window
    if (!otpVerifiedTime || (Date.now() - otpVerifiedTime) > 10 * 60 * 1000) {
      setError("Tasdiqlash vaqti tugagan. Iltimos jarayonni qaytadan boshlang.");
      setTimeout(() => {
        goToStep(1);
        setError('');
      }, 2000);
      return;
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('998') && cleanPhone.length === 9) {
      cleanPhone = '998' + cleanPhone;
    }
    const formattedPhone = '+' + cleanPhone;

    setLoading(true);
    setError('');

    // SECURITY WARNING: /api/v1/auth/change-password endpoint does not verify OTP confirmation server-side.
    // This flow is UX-only protection, not real security. Backend team must add OTP-verified reset token before production launch.
    api.put('/auth/change-password', { phone: formattedPhone, password: newPass })
      .then(() => {
        setLoading(false);
        goToStep(4);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi");
        setLoading(false);
      });
  };

  return (
    <>
      <style>{`
        @keyframes forgotSlideIn {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes forgotSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-15px); }
        }
        @keyframes otpShakeAnimation {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        .forgot-page {
          --primary-dark: ${PRIMARY_DARK};
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        .forgot-left {
          width: 47%;
          min-height: 100vh;
          background: var(--primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
        }
        .forgot-left img {
          width: min(85%, 600px);
          max-height: 80vh;
          object-fit: contain;
          display: block;
        }
        .forgot-right {
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
        .forgot-content-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .forgot-form-container {
          width: 100%;
          max-width: 24rem;
          padding: 0 0.25rem;
        }
        .forgot-step-content {
          animation: ${slideDirection === 'enter' ? 'forgotSlideIn' : 'forgotSlideOut'} 0.25s forwards;
        }
        .forgot-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .forgot-back-btn:hover {
          color: var(--primary-dark);
        }
        .otp-cell-container {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 16px;
        }
        .otp-cell {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 2px solid #d1d5db;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .otp-cell:focus {
          border-color: var(--primary-dark);
          box-shadow: 0 0 0 3px rgba(30, 42, 74, 0.1);
          transform: scale(1.03);
        }
        .otp-shake {
          animation: otpShakeAnimation 0.4s ease-in-out;
        }
        .otp-cell.error {
          border-color: #E53E3E !important;
          background-color: #fef2f2;
        }
        .otp-cell.error:focus {
          border-color: #E53E3E !important;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.15) !important;
        }

        /* Progress Steps */
        .progress-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .progress-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #9ca3af;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
        }
        .progress-dot.active {
          color: #ffffff;
          background-color: var(--primary-dark);
          border-color: var(--primary-dark);
          box-shadow: 0 0 0 3px rgba(30, 42, 74, 0.15);
        }
        .progress-dot.completed {
          color: #ffffff;
          background-color: #10b981;
          border-color: #10b981;
        }

        /* Input & Button styles (shared with Login) */
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
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .forgot-left { display: none; }
          .forgot-right { width: 100%; padding: 2rem 1.5rem 1.5rem; }
          .forgot-form-container { max-width: 100%; padding: 0 1rem; }
        }
      `}</style>

      <div className="forgot-page">
        {/* LEFT PANEL */}
        <div className="forgot-left">
          <img src="/login.img.png" alt="Study illustration" draggable={false} />
        </div>

        {/* RIGHT PANEL */}
        <div className="forgot-right">
          {/* Header Back Button */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <button className="forgot-back-btn" onClick={() => navigate('/login')}>
              <ArrowBackRoundedIcon style={{ fontSize: 16 }} />
              Kirish sahifasiga qaytish
            </button>
          </div>

          <div className="forgot-content-wrapper">
            <div className="forgot-form-container">
              {/* Progress Indicator */}
              <div className="progress-dots">
                {[1, 2, 3, 4].map((num) => {
                  let status = 'future';
                  if (step === num) status = 'active';
                  else if (step > num) status = 'completed';

                  return (
                    <div
                      key={num}
                      className={`progress-dot ${status === 'active' ? 'active' : ''} ${status === 'completed' ? 'completed' : ''}`}
                    >
                      {status === 'completed' ? <CheckRoundedIcon style={{ fontSize: 12 }} /> : num}
                    </div>
                  );
                })}
              </div>

              {/* Slideable Content container */}
              <div className="forgot-step-content">
                {/* STAGE 1: Phone submission */}
                {step === 1 && (
                  <form onSubmit={submitPhone}>
                    {error && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        marginBottom: 16,
                      }}>
                        {error}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <LockResetRoundedIcon style={{ color: PRIMARY_DARK, fontSize: 28 }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: PRIMARY_DARK, margin: 0 }}>
                        Parolni tiklash
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 20px 0' }}>
                      Xavotir olmang, biz sizga yordam beramiz! Telefon raqamingizni kiriting va tasdiqlash kodini oling.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                      <input
                        type="text"
                        placeholder="Telefon raqamingiz (Masalan: +998901234567)"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError('');
                        }}
                        required
                        className="login-input"
                        disabled={loading}
                      />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                      {loading ? "Yuborilmoqda..." : "Tasdiqlash kodini yuborish"}
                    </button>
                  </form>
                )}

                {/* STAGE 2: OTP Entry */}
                {step === 2 && (
                  <form onSubmit={(e) => { e.preventDefault(); submitOtp(); }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: PRIMARY_DARK, marginBottom: 8 }}>
                      Kodni tasdiqlang
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 24px 0' }}>
                      Biz sizning <strong>{phone}</strong> raqamingizga 4 xonali kod yubordik.
                    </p>

                    {/* Numeric custom fields */}
                    <div className={`otp-cell-container ${otpShake ? 'otp-shake' : ''}`}>
                      {otpCells.map((val, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={val}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={handleOtpPaste}
                          className={`otp-cell ${otpError ? 'error' : ''}`}
                          disabled={loading}
                        />
                      ))}
                    </div>

                    {/* Error message below OTP cells */}
                    {error && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        marginBottom: 16,
                        textAlign: 'center',
                      }}>
                        {error}
                      </div>
                    )}

                    {/* Countdown and resend button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                      {resendTimer > 0 ? (
                        <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
                          Qayta yuborish ({resendTimer} soniya)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (loading) return;
                            setLoading(true);
                            setError('');
                            api.post('/auth/send-otp', { phone })
                              .then(() => {
                                setResendTimer(60);
                                setOtpCells(['', '', '', '']);
                                otpRefs[0].current.focus();
                                setLoading(false);
                              })
                              .catch(err => {
                                setError(err.response?.data?.message || "OTP yuborishda xatolik yuz berdi");
                                setLoading(false);
                              });
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '0.82rem',
                            color: PRIMARY_DARK,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Kodni qayta yuborish
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        className="login-btn"
                        style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}
                        disabled={loading}
                        onClick={() => goToStep(1)}
                      >
                        Orqaga
                      </button>
                      <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Tasdiqlanmoqda..." : "Davom etish"}
                      </button>
                    </div>
                  </form>
                )}

                {/* STAGE 3: Password Update */}
                {step === 3 && (
                  <form onSubmit={submitNewPassword}>
                    {error && (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#b91c1c',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        marginBottom: 16,
                      }}>
                        {error}
                      </div>
                    )}

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: PRIMARY_DARK, marginBottom: 8 }}>
                      Yangi parol yaratish
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 20px 0' }}>
                      Endi o'zingizga yangi xavfsiz parol tanlang.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                      <input
                        type="password"
                        placeholder="Yangi parol"
                        value={newPass}
                        onChange={(e) => {
                          setNewPass(e.target.value);
                          setError('');
                        }}
                        required
                        className="login-input"
                        disabled={loading}
                      />
                      
                      {/* Password strength visual status */}
                      {newPass && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                            <span style={{ color: '#6b7280' }}>Parol mustahkamligi:</span>
                            <span style={{ fontWeight: 700, color: strength.color }}>{strength.label}</span>
                          </div>
                          <div style={{ height: 4, width: '100%', backgroundColor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${strength.score}%`, backgroundColor: strength.color, transition: 'width 0.3s' }}></div>
                          </div>
                        </div>
                      )}

                      <input
                        type="password"
                        placeholder="Yangi parolni tasdiqlang"
                        value={confirmPass}
                        onChange={(e) => {
                          setConfirmPass(e.target.value);
                          setError('');
                        }}
                        required
                        className="login-input"
                        disabled={loading}
                      />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                      {loading ? "Parol saqlanmoqda..." : "Parolni yangilash"}
                    </button>
                  </form>
                )}

                {/* STAGE 4: Success confirmation screen */}
                {step === 4 && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      backgroundColor: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px auto',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
                      animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    }}>
                      <CheckCircleRoundedIcon style={{ color: '#10b981', fontSize: 44 }} />
                    </div>
                    
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: PRIMARY_DARK, marginBottom: 8 }}>
                      Muvaffaqiyatli!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                      Ajoyib! Parolingiz muvaffaqiyatli yangilandi 🎉<br />
                      Siz bir necha soniyadan so'ng avtomatik ravishda kirish sahifasiga yo'naltirilasiz.
                    </p>

                    <button type="button" className="login-btn" onClick={handleFinalRedirect}>
                      Kirish sahifasiga o'tish
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
              Copyright © {new Date().getFullYear()} NajotEdu CRM
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
