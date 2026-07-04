import { useApp } from '../../../context/AppContext';

export default function Loader({ fullScreen = true }) {
  const { dark } = useApp();

  const bg = dark
    ? 'linear-gradient(135deg, #0a0a0f 0%, #10101a 100%)'
    : 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)';

  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'absolute',
      inset: 0,
      width: fullScreen ? '100vw' : '100%',
      height: fullScreen ? '100vh' : '100%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: fullScreen ? 9999 : 10,
    }}>
      <span className="loader"></span>
    </div>
  );
}
