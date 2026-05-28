import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/api";
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const toolBtn = "w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors";

export default function CreateHomework() {
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (groupId) {
      api.get(`/lessons/my/group/${groupId}`)
        .then(res => { const d = res.data.data || res.data || []; setLessons(Array.isArray(d) ? d : [d]); })
        .catch(console.error);
    }
  }, [groupId]);

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const handleSubmit = async () => {
    if (!lessonId) { setError("Mavzuni tanlang!"); return; }
    if (!title.trim()) { setError("Izoh kiritilishi shart!"); return; }
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("lesson_id", Number(lessonId));
      fd.append("group_id", Number(groupId));
      fd.append("title", title);
      if (file) fd.append("file", file);
      await api.post("/homework", fd, { headers: { "Content-Type": "multipart/form-data" } });
      navigate(-1);
    } catch (err) { console.error(err); setError("Xatolik yuz berdi. Qayta urinib ko'ring."); }
    finally { setLoading(false); }
  };

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-auto pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Yangi uyga vazifa yaratish</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6 max-w-3xl">
        {/* Lesson select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <span className="text-red-500">*</span> Mavzu
          </label>
          <select
            value={lessonId}
            onChange={e => setLessonId(e.target.value)}
            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:border-[#6c35de] outline-none"
          >
            <option value="">Mavzuni tanlang...</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.topic || l.title || l.name}</option>
            ))}
          </select>
        </div>

        {/* Rich text editor */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <span className="text-red-500">*</span> Izoh
          </label>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
              <button type="button" className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors">H1</button>
              <button type="button" className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors">H2</button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <select className="h-7 px-1.5 border border-slate-200 rounded text-xs bg-white text-slate-600 focus:outline-none">
                <option>Sans Serif</option>
              </select>
              <select className="h-7 px-1.5 border border-slate-200 rounded text-xs bg-white text-slate-600 focus:outline-none ml-1">
                <option>Normal</option>
              </select>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button type="button" className={toolBtn}><FormatBoldRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><FormatItalicRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><FormatUnderlinedRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><StrikethroughSRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><FormatQuoteRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><CodeRoundedIcon fontSize="small" /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button type="button" className={toolBtn}><FormatListBulletedRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><FormatListNumberedRoundedIcon fontSize="small" /></button>
              <button type="button" className={toolBtn}><FormatAlignLeftRoundedIcon fontSize="small" /></button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button type="button" className={toolBtn}><InsertLinkRoundedIcon fontSize="small" /></button>
            </div>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
              className="w-full min-h-[180px] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none"
            />
          </div>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#6c35de] hover:bg-[#6c35de]/5 transition-all"
        >
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
          {file ? (
            <div className="flex items-center gap-3">
              <InsertDriveFileRoundedIcon className="text-[#6c35de]" />
              <span className="text-sm font-medium text-slate-700">{file.name}</span>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 rounded transition-colors">
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CloudUploadRoundedIcon className="text-slate-400" style={{ fontSize: 36 }} />
              <p className="text-sm text-slate-500">Faylni tanlash yoki shu yerga tashlang</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Bekor qilish
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-[#6c35de] rounded-xl hover:bg-[#5a2cc0] transition-colors disabled:opacity-50">
            {loading ? "Yuborilmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}
