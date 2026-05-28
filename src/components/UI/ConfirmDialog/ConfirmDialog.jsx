import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "O'chirish",
  message = "Rostdan ham o'chirishni hohlaysizmi?"
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] transition-opacity duration-200 ${!isOpen ? 'opacity-0' : 'opacity-100'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-6 w-[360px] shadow-2xl transition-all duration-200 ${!isOpen ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Ha
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
