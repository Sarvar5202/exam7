import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

export default function StudentSettings() {
  const { dark, toggleDark, lang, toggleLang } = useApp();
  const navigate = useNavigate();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';
  const inputBg  = dark ? '#16161f' : '#f8fafc';

  // Sessiyadan real ma'lumotlar
  const studentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('studentUser')) || {}; }
    catch { return {}; }
  })();

  const fullName  = studentUser.full_name || '—';
  const phone     = studentUser.phone     || '—';
  const email     = studentUser.email     || '—';
  const role      = studentUser.role      || 'STUDENT';
  const birthDate = studentUser.birth_date || studentUser.birthDate || '—';
  const address   = studentUser.address   || '—';

  // Avatar — ismning birinchi harfi
  const avatarLetter = fullName !== '—' ? fullName.charAt(0).toUpperCase() : 'S';

  const handleLogout = () => {
    sessionStorage.removeItem('studentToken');
    sessionStorage.removeItem('studentRefreshToken');
    sessionStorage.removeItem('studentUser');
    navigate('/student/login', { replace: true });
  };

  const fields = [
    { icon: <PersonRoundedIcon style={{ fontSize: 18 }} />,       label: lang === 'uz' ? 'Ism Familiya' : 'Имя Фамилия', value: fullName },
    { icon: <PhoneRoundedIcon style={{ fontSize: 18 }} />,        label: lang === 'uz' ? 'Telefon' : 'Телефон',         value: phone },
    { icon: <EmailRoundedIcon style={{ fontSize: 18 }} />,        label: 'Email',                                        value: email },
    { icon: <BadgeRoundedIcon style={{ fontSize: 18 }} />,        label: lang === 'uz' ? 'Rol' : 'Роль',                value: role },
    { icon: <CalendarMonthRoundedIcon style={{ fontSize: 18 }} />, label: lang === 'uz' ? "Tug'ilgan sana" : 'Дата рождения', value: birthDate },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6" style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
        {lang === 'uz' ? 'Sozlamalar' : 'Настройки'}
      </h1>

      {/* Profile */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, marginBottom: 20 }}>
          {lang === 'uz' ? 'Profil' : 'Профиль'}
        </h3>

        {/* Avatar + ism */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c35de, #9b6dff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '1.5rem',
            boxShadow: '0 4px 16px rgba(108,53,222,0.3)',
            flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: textMain, fontSize: '1rem', margin: 0 }}>{fullName}</p>
            <p style={{ fontSize: '0.82rem', color: textSub, margin: '2px 0 0' }}>{email !== '—' ? email : phone}</p>
            <span style={{
              display: 'inline-block', marginTop: 4,
              padding: '2px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
              background: dark ? 'rgba(108,53,222,0.2)' : '#f3f0ff', color: '#6c35de',
            }}>
              {role}
            </span>
          </div>
        </div>

        {/* Ma'lumotlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map((item, i) => (
            <div key={i}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, marginBottom: 4, display: 'block' }}>
                {item.label}
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: inputBg, border: `1px solid ${border}`, borderRadius: 10,
              }}>
                <span style={{ color: textSub }}>{item.icon}</span>
                <span style={{ fontSize: '0.88rem', color: textMain }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ko'rinish */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, marginBottom: 20 }}>
          {lang === 'uz' ? "Ko'rinish" : 'Внешний вид'}
        </h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={toggleDark} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 12, background: inputBg,
            border: `1.5px solid ${dark ? '#6c35de' : border}`,
            color: textMain, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {dark ? <LightModeRoundedIcon style={{ fontSize: 18 }} /> : <DarkModeRoundedIcon style={{ fontSize: 18 }} />}
            {dark ? (lang === 'uz' ? "Yorug' rejim" : 'Светлый режим') : (lang === 'uz' ? "Qorong'u rejim" : 'Тёмный режим')}
          </button>
          <button onClick={toggleLang} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 12, background: inputBg,
            border: `1.5px solid ${border}`,
            color: textMain, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <TranslateRoundedIcon style={{ fontSize: 18 }} />
            {lang === 'uz' ? 'Русский тилига' : "O'zbek tiliga"}
          </button>
        </div>
      </div>

      {/* Xavfsizlik */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, marginBottom: 20 }}>
          {lang === 'uz' ? 'Xavfsizlik' : 'Безопасность'}
        </h3>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          borderRadius: 10, background: inputBg, border: `1px solid ${border}`,
          color: textMain, fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
          width: '100%', transition: 'all 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#6c35de'}
          onMouseOut={e => e.currentTarget.style.borderColor = border}
        >
          <LockRoundedIcon style={{ fontSize: 18, color: textSub }} />
          {lang === 'uz' ? "Parolni o'zgartirish" : 'Сменить пароль'}
        </button>
      </div>

      {/* Chiqish */}
      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px', borderRadius: 12,
        background: dark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
        border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
        color: '#ef4444', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
        marginBottom: 20, transition: 'all 0.2s',
      }}
        onMouseOver={e => e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.2)' : '#fee2e2'}
        onMouseOut={e => e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
      >
        <LogoutRoundedIcon style={{ fontSize: 20 }} />
        {lang === 'uz' ? 'Chiqish' : 'Выйти'}
      </button>
    </div>
  );
}
