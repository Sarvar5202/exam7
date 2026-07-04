import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

export default function TeacherHeader({ onMenuClick }) {
  const { dark, toggleDark, lang, toggleLang } = useApp();
  const navigate = useNavigate();

  const bg       = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textSub  = dark ? '#55556a' : '#94a3b8';
  const textMain = dark ? '#e0e0f0' : '#1e293b';

  // Try to get teacher name from token payload
  let teacherName = 'T';
  try {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const name = payload.firstName || payload.name || payload.username || '';
      if (name) teacherName = name[0].toUpperCase();
    }
  } catch {}

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      height: 60, background: bg, borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', flexShrink: 0, transition: 'background 0.25s',
    }}>
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile hamburger */}
        <button onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center rounded-xl transition-colors"
          style={{
            width: 36, height: 36, background: dark ? '#1a1a28' : '#f8fafc',
            border: `1px solid ${border}`, color: textSub, cursor: 'pointer',
          }}>
          <MenuRoundedIcon fontSize="small" />
        </button>

        {/* Page title badge */}
        <div className="hidden lg:flex" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)',
          border: '1px solid rgba(20,184,166,0.2)', borderRadius: 10,
          padding: '5px 14px',
        }}>
          <SchoolRoundedIcon style={{ fontSize: 18, color: '#14b8a6' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#14b8a6' }}>
            {lang === 'uz' ? "O'qituvchi paneli" : "Панель учителя"}
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          borderRadius: 10, padding: '0 14px', height: 36, minWidth: 200,
        }}>
          <SearchRoundedIcon style={{ fontSize: 18, color: textSub }} />
          <input type="text" placeholder={lang === 'uz' ? "Qidirish..." : "Поиск..."}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: '0.82rem', color: textMain, width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Language */}
        <button onClick={toggleLang} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 12px', borderRadius: 8,
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          color: textSub, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          <span>{lang === 'uz' ? "O'zbekcha" : "Русский"}</span>
          <KeyboardArrowDownRoundedIcon style={{ fontSize: 16 }} />
        </button>

        {/* Notification */}
        <button style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          borderRadius: 10, color: textSub, cursor: 'pointer', position: 'relative',
          transition: 'all 0.2s',
        }}>
          <NotificationsNoneRoundedIcon fontSize="small" />
          <span style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            borderRadius: '50%', background: '#14b8a6',
          }} />
        </button>

        {/* Dark mode toggle */}
        <button onClick={toggleDark} style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          borderRadius: 10, color: textSub, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {dark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
        </button>

        {/* Avatar — click to logout */}
        <div onClick={handleLogout} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(20,184,166,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(20,184,166,0.5)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(20,184,166,0.35)';
          }}
          title={lang === 'uz' ? "Chiqish" : "Выйти"}
        >
          {teacherName}
        </div>
      </div>
    </header>
  );
}
