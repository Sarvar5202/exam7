import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddStudentModal from "./AddStudentModal/AddStudentModal";

export default function StudentModal({ isOpen, onClose, onSave, studentToEdit }) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) { setShouldRender(true); document.body.style.overflow = 'hidden'; }
    else { const t = setTimeout(() => { setShouldRender(false); document.body.style.overflow = 'unset'; }, 300); return () => clearTimeout(t); }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-end z-[9999] transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`}
      onClick={onClose}
    >
      <AddStudentModal isOpen={isOpen} onClose={onClose} onSave={onSave} studentToEdit={studentToEdit} />
    </div>,
    document.body
  );
}
