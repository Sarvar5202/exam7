import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

const ICONS = [
  <HomeRoundedIcon />,
  <PersonRoundedIcon />,
  <GroupRoundedIcon />,
  <DiamondRoundedIcon />,
  <CardGiftcardRoundedIcon />,
  <SettingsRoundedIcon />,
];
const PATHS = [
  "/dashboard",
  "/dashboard/teachers",
  "/dashboard/groups",
  "/dashboard/students",
  "/dashboard/gifts",
  "/management",
];

export default function Sidebar({ isCollapsed, toggleSidebar, isSubSidebarOpen, toggleSubSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dark, toggleDark, lang, toggleLang, t } = useApp();

  const bg       = dark ? '#0d0d14' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#55556a' : '#94a3b8';
  const activeBg = dark ? 'rgba(108,53,222,0.25)' : '#6c35de';
  const activeText = '#ffffff';
  const hoverBg  = dark ? 'rgba(108,53,222,0.1)' : '#f5f3ff';
  const hoverText = dark ? '#c0b0ff' : '#6c35de';

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        borderRight: `1px solid ${border}`,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        zIndex: 100,
        transition: 'width 0.3s, background 0.25s',
        width: isCollapsed ? 80 : 260,
        minHeight: '100vh',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: isCollapsed ? '18px 0' : '18px 20px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        borderBottom: `1px solid ${border}`,
        position: 'relative',
        marginBottom: 8,
      }}>
        <img src="/login.img.png" alt="Najot" style={{ width: 40, height: 40, flexShrink: 0, objectFit: 'contain' }} />
        {!isCollapsed && (
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: textMain, letterSpacing: '-0.3px' }}>
            Najot CRM
          </span>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            right: -13,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#6c35de',
            color: '#fff',
            border: `2px solid ${bg}`,
            borderRadius: 6,
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
        >
          <ChevronLeftRoundedIcon
            fontSize="small"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: isCollapsed ? '0 12px' : '0 12px' }}>
        {t.menu.map((label, i) => {
          const isManagement = i === 5;
          const active = isManagement ? pathname.startsWith('/management') : (i === 0 ? pathname === '/dashboard' : pathname.startsWith(PATHS[i]));
          return (
            <NavLink
              key={PATHS[i]}
              to={PATHS[i]}
              end={i === 0}
              onClick={() => {
                if (isManagement) toggleSubSidebar();
                else if (isSubSidebarOpen) toggleSubSidebar();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: isCollapsed ? '12px 0' : '10px 14px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 500,
                background: active ? activeBg : 'transparent',
                color: active ? activeText : textSub,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverText; } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; } }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>{ICONS[i]}</span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Obuna box */}
      <div style={{
        margin: isCollapsed ? '8px' : '8px 12px',
        background: dark ? '#13131e' : '#f8fafc',
        borderRadius: 12,
        border: `1px solid ${border}`,
        padding: isCollapsed ? '10px 0' : '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCollapsed ? 'center' : 'flex-start',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <img src="/alarm.png" alt="" style={{ height: 22, width: 22, opacity: 0.8 }} />
          {!isCollapsed && (
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.78rem', color: textMain, margin: 0 }}>{t.subscription}</p>
              <p style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 500, margin: 0 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginRight: 4 }} />
                {t.subscriptionExpired}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button style={{
            width: '100%',
            background: '#6c35de',
            color: '#fff',
            borderRadius: 7,
            padding: '7px 0',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}>
            {t.subscriptionRenew}
          </button>
        )}
      </div>

      {/* Dark mode + Til */}
      <div style={{
        padding: isCollapsed ? '8px 12px' : '8px 12px',
        borderTop: `1px solid ${border}`,
        display: 'flex',
        flexDirection: isCollapsed ? 'column' : 'row',
        gap: 6,
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: 8,
      }}>
        <button
          onClick={toggleDark}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: isCollapsed ? '8px 0' : '7px 12px',
            width: isCollapsed ? '100%' : 'auto',
            justifyContent: 'center', borderRadius: 8,
            background: dark ? 'rgba(255,255,255,0.05)' : '#f1f3f9',
            color: dark ? '#a0a0c0' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600,
            border: `1px solid ${border}`, cursor: 'pointer',
            transition: 'all 0.2s', flex: isCollapsed ? 'none' : 1,
          }}
        >
          {dark ? <LightModeRoundedIcon style={{ fontSize: 16 }} /> : <DarkModeRoundedIcon style={{ fontSize: 16 }} />}
          {!isCollapsed && <span>{dark ? t.lightMode : t.darkMode}</span>}
        </button>
        <button
          onClick={toggleLang}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: isCollapsed ? '8px 0' : '7px 12px',
            width: isCollapsed ? '100%' : 'auto',
            justifyContent: 'center', borderRadius: 8,
            background: dark ? 'rgba(255,255,255,0.05)' : '#f1f3f9',
            color: dark ? '#a0a0c0' : '#64748b',
            fontSize: '0.78rem', fontWeight: 700,
            border: `1px solid ${border}`, cursor: 'pointer',
            transition: 'all 0.2s', flex: isCollapsed ? 'none' : 1, letterSpacing: 0.5,
          }}
        >
          <TranslateRoundedIcon style={{ fontSize: 16 }} />
          {!isCollapsed && <span>{lang === 'uz' ? 'RU' : 'UZ'}</span>}
        </button>
      </div>
    </aside>
  );
}
