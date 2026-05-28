import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="text-8xl font-black text-[#6c35de] leading-none">404</div>
        <div className="w-16 h-px bg-slate-200" />
        <h1 className="text-xl font-bold text-slate-800">Sahifa topilmadi</h1>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          Siz qidirgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-2 px-6 py-2.5 bg-[#6c35de] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2cc0] transition-colors"
        >
          Bosh sahifaga
        </button>
      </div>
    </div>
  );
}
