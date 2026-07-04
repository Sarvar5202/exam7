import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useApp } from '../../context/AppContext';

export default function BackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dark, lang } = useApp();

  // Bosh sahifa (Dashboard) da orqaga qaytish tugmasi ko'rsatilmaydi
  if (pathname === '/student/dashboard' || pathname === '/student') {
    return null;
  }

  const handleBack = () => {
    // Agar browser tarixi bo'sh bo'lsa (tashqi linkdan kelgan bo'lsa)
    const hasHistory = window.history.state && window.history.state.idx > 0;
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  const text = lang === 'uz' ? 'Ortga qaytish' : 'Назад';

  return (
    <button
      onClick={handleBack}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        margin: '16px 0 8px 0',
        borderRadius: 10,
        border: 'none',
        background: dark ? '#161622' : '#ffffff',
        color: dark ? '#a0a0c0' : '#475569',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        minHeight: 44, // Mobile-friendly tap target
        userSelect: 'none',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = '#6c35de';
        e.currentTarget.style.background = dark ? '#1e1e2d' : '#f8f6ff';
        e.currentTarget.style.transform = 'translateX(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = dark ? '#a0a0c0' : '#475569';
        e.currentTarget.style.background = dark ? '#161622' : '#ffffff';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <ArrowBackRoundedIcon fontSize="small" />
      <span>{text}</span>
    </button>
  );
}
