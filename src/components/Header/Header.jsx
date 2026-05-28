import { useApp } from "../../context/AppContext";
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

export default function Header({ onMenuClick }) {
  const { dark } = useApp();

  const bg      = dark ? '#111118' : '#ffffff';
  const border  = dark ? '#1e1e2a' : '#f0f0f5';
  const textSub = dark ? '#55556a' : '#94a3b8';

  return (
    <header style={{
      height: 60,
      background: bg,
      borderBottom: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      transition: 'background 0.25s',
    }}>
      {/* Mobilda hamburger — desktopda yashirin */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center rounded-xl transition-colors"
        style={{
          width: 36, height: 36,
          background: dark ? '#1a1a28' : '#f8fafc',
          border: `1px solid ${border}`,
          color: textSub,
          cursor: 'pointer',
        }}
      >
        <MenuRoundedIcon fontSize="small" />
      </button>

      {/* Desktop da bo'sh joy — right tomonda ikonkalar */}
      <div className="hidden lg:block" />

      {/* O'ng: bildirishnoma + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: dark ? '#1a1a28' : '#f8fafc',
          border: `1px solid ${border}`,
          borderRadius: 10,
          color: textSub,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}>
          <NotificationsNoneRoundedIcon fontSize="small" />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: '#6c35de',
          }} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6c35de, #9b6dff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem',
          cursor: 'pointer',
        }}>
          A
        </div>
      </div>
    </header>
  );
}
