import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

const STUDENT_MENU = [
  { icon: <HomeRoundedIcon />,           label_uz: "Bosh sahifa",       label_ru: "Главная",           path: "/student/dashboard" },
  { icon: <PaymentRoundedIcon />,        label_uz: "To'lovlarim",       label_ru: "Мои оплаты",        path: "/student/payments" },
  { icon: <GroupRoundedIcon />,          label_uz: "Guruhlarim",        label_ru: "Мои группы",        path: "/student/groups" },
  { icon: <BarChartRoundedIcon />,       label_uz: "Ko'rsatkichlarim",  label_ru: "Показатели",        path: "/student/stats" },
  { icon: <LeaderboardRoundedIcon />,    label_uz: "Reyting",           label_ru: "Рейтинг",           path: "/student/rating" },
  { icon: <ShoppingCartRoundedIcon />,   label_uz: "Do'kon",            label_ru: "Магазин",           path: "/student/shop" },
  { icon: <SensorsRoundedIcon />,        label_uz: "Qo'shimcha darslar", label_ru: "Доп. уроки",      path: "/student/extra-lessons" },
  { icon: <SettingsRoundedIcon />,       label_uz: "Sozlamalar",        label_ru: "Настройки",         path: "/student/settings" },
];

export default function StudentSidebar({ isCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dark, toggleDark, lang, toggleLang } = useApp();

  const bg       = dark ? '#0d0d14' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#55556a' : '#94a3b8';
  const activeBg = dark ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.08)';
  const activeText = '#f97316';
  const hoverBg  = dark ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.04)';
  const hoverText = '#f97316';

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column', background: bg,
      borderRight: `1px solid ${border}`, borderTopRightRadius: 16,
      borderBottomRightRadius: 16, zIndex: 100,
      transition: 'width 0.3s, background 0.25s',
      width: isCollapsed ? 80 : 260, minHeight: '100vh', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: isCollapsed ? '18px 0' : '18px 20px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        borderBottom: `1px solid ${border}`, position: 'relative', marginBottom: 8,
      }}>
        <img src="/login.img.png" alt="Najot" style={{ width: 40, height: 40, flexShrink: 0, objectFit: 'contain' }} />
        {!isCollapsed && (
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.4px', fontFamily: '"Outfit", sans-serif' }}>
            <span style={{ color: dark ? '#ffffff' : '#0b245c' }}>Najot</span>
            <span style={{ color: '#f97316' }}>Edu</span>
          </span>
        )}
        <button onClick={toggleSidebar} style={{
          position: 'absolute', right: -13, top: '50%', transform: 'translateY(-50%)',
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#6c35de', color: '#fff', border: `2px solid ${bg}`,
          borderRadius: 6, cursor: 'pointer', zIndex: 10, transition: 'background 0.2s',
        }}>
          <ChevronLeftRoundedIcon fontSize="small"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {STUDENT_MENU.map((item, i) => {
          const active = i === 0
            ? pathname === item.path
            : pathname.startsWith(item.path);
          const label = lang === 'uz' ? item.label_uz : item.label_ru;
          return (
            <NavLink key={item.path} to={item.path} end={i === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: isCollapsed ? '12px 0' : '10px 14px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 10, textDecoration: 'none', fontSize: '0.875rem',
                fontWeight: active ? 700 : 500,
                background: active ? activeBg : 'transparent',
                color: active ? activeText : textSub,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverText; } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; } }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Dark mode + Til */}
      <div style={{
        padding: '8px 12px', borderTop: `1px solid ${border}`,
        display: 'flex', flexDirection: isCollapsed ? 'column' : 'row',
        gap: 6, alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: 8,
      }}>
        <button onClick={toggleDark} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: isCollapsed ? '8px 0' : '7px 12px',
          width: isCollapsed ? '100%' : 'auto', justifyContent: 'center', borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.05)' : '#f1f3f9',
          color: dark ? '#a0a0c0' : '#64748b', fontSize: '0.78rem', fontWeight: 600,
          border: `1px solid ${border}`, cursor: 'pointer',
          transition: 'all 0.2s', flex: isCollapsed ? 'none' : 1,
        }}>
          {dark ? <LightModeRoundedIcon style={{ fontSize: 16 }} /> : <DarkModeRoundedIcon style={{ fontSize: 16 }} />}
          {!isCollapsed && <span>{dark ? "Yorug'" : "Qorong'u"}</span>}
        </button>
        <button onClick={toggleLang} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: isCollapsed ? '8px 0' : '7px 12px',
          width: isCollapsed ? '100%' : 'auto', justifyContent: 'center', borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.05)' : '#f1f3f9',
          color: dark ? '#a0a0c0' : '#64748b', fontSize: '0.78rem', fontWeight: 700,
          border: `1px solid ${border}`, cursor: 'pointer',
          transition: 'all 0.2s', flex: isCollapsed ? 'none' : 1, letterSpacing: 0.5,
        }}>
          <TranslateRoundedIcon style={{ fontSize: 16 }} />
          {!isCollapsed && <span>{lang === 'uz' ? 'RU' : 'UZ'}</span>}
        </button>
      </div>
    </aside>
  );
}
