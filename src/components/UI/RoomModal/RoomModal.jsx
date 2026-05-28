import { useEffect, useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { createPortal } from "react-dom";

export default function RoomModal({ isOpen, onClose, title, children, footer }) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const t = setTimeout(() => { setShouldRender(false); document.body.style.overflow = 'unset'; }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-end z-[9999] transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white h-full w-[420px] max-w-full flex flex-col shadow-2xl transition-transform duration-300 ${!isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
