import { useEffect, useState } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const ICONS = {
  success: <CheckCircleRoundedIcon fontSize="small" />,
  error:   <ErrorRoundedIcon fontSize="small" />,
  info:    <InfoRoundedIcon fontSize="small" />,
};
const COLORS = {
  success: { bg: "#22c55e", text: "#fff" },
  error:   { bg: "#ef4444", text: "#fff" },
  info:    { bg: "#6c35de", text: "#fff" },
};

// Global toast chaqirish uchun
let _showToast = null;
export const toast = {
  success: (msg) => _showToast?.("success", msg),
  error:   (msg) => _showToast?.("error",   msg),
  info:    (msg) => _showToast?.("info",    msg),
};

export default function Toast() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    _showToast = (type, message) => {
      const id = Date.now();
      setItems(prev => [...prev, { id, type, message }]);
      setTimeout(() => {
        setItems(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };
    return () => { _showToast = null; };
  }, []);

  const remove = (id) => setItems(prev => prev.filter(t => t.id !== id));

  if (items.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none",
      width: "100%",
      maxWidth: 400,
      padding: "0 16px",
    }}>
      {items.map(item => {
        const col = COLORS[item.type];
        return (
          <div key={item.id} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 12,
            background: col.bg,
            color: col.text,
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            pointerEvents: "auto",
            animation: "slideDown 0.25s ease",
          }}>
            <span style={{ flexShrink: 0 }}>{ICONS[item.type]}</span>
            <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600 }}>{item.message}</span>
            <button
              onClick={() => remove(item.id)}
              style={{
                background: "rgba(255,255,255,0.25)",
                border: "none",
                borderRadius: 6,
                width: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <CloseRoundedIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
