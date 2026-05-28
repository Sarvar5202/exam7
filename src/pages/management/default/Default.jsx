import { useNavigate } from "react-router-dom";

export default function Default() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 pt-4">
      <p className="text-sm text-slate-500">Boshqarish bo'limini tanlang:</p>
      {['courses', 'rooms', 'staff'].map(slug => (
        <button key={slug} onClick={() => navigate(`/management/${slug}`)} className="text-left px-4 py-3 bg-white rounded-xl border border-slate-100 text-sm font-medium text-slate-700 hover:border-[#6c35de] hover:text-[#6c35de] transition-all">
          {slug === 'courses' ? 'Kurslar' : slug === 'rooms' ? 'Xonalar' : 'Xodimlar'}
        </button>
      ))}
    </div>
  );
}
