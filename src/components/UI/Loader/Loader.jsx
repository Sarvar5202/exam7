import { useApp } from '../../../context/AppContext';

export default function Loader({ fullScreen = true }) {
  const { dark, t } = useApp();

  const bg = dark
    ? 'linear-gradient(135deg, #0a0a0f 0%, #10101a 100%)'
    : 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)';

  const ringColor = dark ? '#6c35de' : '#6c35de';
  const textColor = dark ? '#c0b0ff' : '#6c35de';
  const subColor  = dark ? '#44446a' : '#94a3b8';
  const dotColor  = dark ? '#6c35de' : '#6c35de';

  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'absolute',
      inset: 0,
      width: fullScreen ? '100vw' : '100%',
      height: fullScreen ? '100vh' : '100%',
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: fullScreen ? 9999 : 10,
      gap: 20,
    }}>

      {/* Spinner ring + NT harfi */}
      <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `3px solid ${dark ? '#1e1e2e' : '#e2e8f0'}`,
          borderTopColor: ringColor,
          animation: 'ntSpin 1s linear infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          inset: 10,
          borderRadius: '50%',
          border: `2px solid transparent`,
          borderBottomColor: dark ? '#3a2060' : '#ddd6fe',
          animation: 'ntSpin 1.5s linear infinite reverse',
        }} />
        {/* Center - N harfi */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: dark ? '#1a1025' : '#6c35de',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 900,
          color: '#ffffff',
          fontFamily: 'Outfit, Inter, sans-serif',
          animation: 'ntPulse 1.8s ease-in-out infinite',
          boxShadow: `0 0 20px ${dark ? 'rgba(108,53,222,0.5)' : 'rgba(108,53,222,0.3)'}`,
        }}>
          N
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: textColor,
          fontFamily: 'Outfit, Inter, sans-serif',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          Najot CRM
        </div>
        <div style={{ fontSize: '0.72rem', color: subColor, letterSpacing: '0.5px' }}>
          {t?.loading || 'Yuklanmoqda'}...
        </div>
      </div>

      {/* 3 nuqta */}
      <div style={{ display: 'flex', gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dotColor,
            animation: `ntDot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
