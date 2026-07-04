import { useEffect, useState, useTransition, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import { toast } from '../../components/UI/Toast/Toast';
import { useApp } from '../../context/AppContext';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TeacherModal from "../../components/UI/TeacherModal/TeacherModal";
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";
import Loader from "../../components/UI/Loader/Loader";

const actionBtn = "w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors";

export default function Teachers() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherData, setTeacherData] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, teacherId: null });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Qidiruv holatlari
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef(null);

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  };

  // --- Oddiy pagination so'rovi (limit=3) ---
  const fetchTeachers = (targetPage = 1) => {
    setIsLoading(true);
    api.get(`/teachers?page=${targetPage}&limit=3`)
      .then(res => {
        const data = res.data.data || [];
        if (data.length > 0 || targetPage === 1) {
          setTeacherData(data);
          setPage(targetPage);
        }
        if (res.data.meta?.last_page) setTotalPages(res.data.meta.last_page);
        else if (res.data.totalPages) setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  // --- Qidiruv so'rovi (limit=500) ---
  const fetchAllForSearch = () => {
    setIsSearchLoading(true);
    api.get('/teachers?page=1&limit=500')
      .then(res => {
        setAllTeachers(res.data.data || []);
      })
      .catch(err => console.log(err.message))
      .finally(() => setIsSearchLoading(false));
  };

  // Boshlang'ich yuklash
  useEffect(() => {
    startTransition(async () => { fetchTeachers(1); });
  }, []);

  // Input o'zgarganda debounce (600ms)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      // Qidiruv tozalanganda — pagination rejimiga qaytish
      setDebouncedQuery('');
      setAllTeachers([]);
      startTransition(() => { fetchTeachers(1); });
      return;
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val.trim());
      fetchAllForSearch();
    }, 600);
  };

  // Frontend filterlash
  const filteredTeachers = debouncedQuery
    ? allTeachers.filter(teacher => {
        const q = debouncedQuery.toLowerCase();
        return (
          teacher.full_name?.toLowerCase().includes(q) ||
          teacher.phone?.toLowerCase().includes(q) ||
          teacher.email?.toLowerCase().includes(q) ||
          teacher.address?.toLowerCase().includes(q) ||
          teacher.groups?.some(g => (g?.name ?? g?.title ?? String(g)).toLowerCase().includes(q))
        );
      })
    : teacherData;

  const getPaginationGroup = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const handleTeacherSubmit = (payload, teacherToEdit, localData) => {
    setIsLoading(true);
    const request = teacherToEdit?.id ? api.patch(`/teachers/${teacherToEdit.id}`, payload) : api.post('/teachers', payload);
    request.then(res => {
      if (teacherToEdit?.id) {
        setTeacherData(prev => prev.map(tc => tc.id === teacherToEdit.id ? { ...tc, full_name: localData?.fullName || tc.full_name, email: localData?.email || tc.email, phone: localData?.phone || tc.phone, address: localData?.address || tc.address, groups: localData?.groups || tc.groups } : tc));
        setAllTeachers(prev => prev.map(tc => tc.id === teacherToEdit.id ? { ...tc, full_name: localData?.fullName || tc.full_name, email: localData?.email || tc.email, phone: localData?.phone || tc.phone, address: localData?.address || tc.address, groups: localData?.groups || tc.groups } : tc));
      } else {
        if (res.data?.data) setTeacherData(prev => [res.data.data, ...prev]);
        else fetchTeachers(1);
      }
      setIsModalOpen(false); setSelectedTeacher(null);
      toast.success(teacherToEdit?.id ? t.teacherUpdated : t.teacherAdded);
    }).catch(err => {
      if (err.response?.status === 304) { setIsModalOpen(false); setSelectedTeacher(null); return; }
      toast.error(t.errorGeneral);
    }).finally(() => setIsLoading(false));
  };

  const actualDeleteTeacher = (tid) => {
    setIsLoading(true);
    api.delete(`/teachers/${tid}`)
      .then(res => {
        if (res.status === 200 || res.status === 204) {
          setTeacherData(prev => prev.filter(tc => tc.id !== tid));
          setAllTeachers(prev => prev.filter(tc => tc.id !== tid));
          toast.success(t.teacherDeleted);
        }
      })
      .catch(() => toast.error(t.errorGeneral))
      .finally(() => setIsLoading(false));
  };

  // Qidiruv paytida to'liq ekran Loader ko'rsatish
  if (isSearchLoading) {
    return <Loader fullScreen={false} />;
  }

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">{t.teachersTitle}</h1>
          <button onClick={() => { setSelectedTeacher(null); setIsModalOpen(true); }} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" /><span>{t.addTeacher}</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a] leading-relaxed m-0">{t.teachersSubtitle}</p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FilterListRoundedIcon fontSize="small" />{t.filter}
            </button>
            <button onClick={() => navigate('/dashboard/teachers/archive')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ArchiveOutlinedIcon fontSize="small" />{t.archive}
            </button>
          </div>
          {/* Qidiruv input */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.search}
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-[#6c35de] outline-none w-full sm:w-[220px]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  setDebouncedQuery('');
                  setAllTeachers([]);
                  startTransition(() => { fetchTeachers(1); });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                title="Tozalash"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {/* Desktop jadval */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500 w-10"><input type="checkbox" /></th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.fullName} ↓</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.group}</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.phone}</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.email}</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.address}</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">{t.date}</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, i) => (
                <tr key={teacher.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3"><input type="checkbox" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {teacher.photo ? (
                        <img 
                          src={`https://najot-edu.softwareengineer.uz/files/${teacher.photo}`} 
                          alt={teacher.full_name} 
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {teacher.full_name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{teacher.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {teacher.groups?.map((g, idx) => {
                        const key = g?.id ?? `${g?.name ?? String(g)}-${idx}`;
                        const label = g?.name ?? g?.title ?? String(g);
                        return <span key={key} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{label}</span>;
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{teacher.phone}</td>
                  <td className="px-5 py-3 text-slate-700">{teacher.email}</td>
                  <td className="px-5 py-3 text-slate-700">{teacher.address}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(teacher.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className={actionBtn}><VisibilityOutlinedIcon fontSize="small" /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                      <button onClick={() => { setSelectedTeacher(teacher); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobil card ko'rinishi */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
            {filteredTeachers.map((teacher, i) => (
              <div key={teacher.id ?? i} className="flex items-center gap-3 px-4 py-3">
                {teacher.photo ? (
                  <img 
                    src={`https://najot-edu.softwareengineer.uz/files/${teacher.photo}`} 
                    alt={teacher.full_name} 
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                    {teacher.full_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{teacher.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{teacher.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.groups?.slice(0, 2).map((g, idx) => {
                      const key = g?.id ?? `${g?.name ?? String(g)}-${idx}`;
                      const label = g?.name ?? g?.title ?? String(g);
                      return <span key={key} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{label}</span>;
                    })}
                    {(teacher.groups?.length ?? 0) > 2 && (
                      <span className="text-xs text-slate-400">+{teacher.groups.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setDeleteConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                  <button onClick={() => { setSelectedTeacher(teacher); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination — faqat qidiruv bo'sh bo'lganda ko'rsatiladi */}
        {!debouncedQuery && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <button
              onClick={() => { if (page > 1) startTransition(() => { fetchTeachers(page - 1); }); }}
              disabled={page === 1 || isPending || isLoading}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >{t.previous}</button>
            <div className="flex items-center gap-1">
              {getPaginationGroup().map((p, i) => p === '...' ? <span key={i} className="px-2 text-slate-400">...</span> :
                <button key={i} onClick={() => { if (page !== p) startTransition(() => { fetchTeachers(p); }); }} disabled={isPending || isLoading} className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg border transition-colors ${page === p ? 'bg-[#6c35de] text-white border-[#6c35de]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
              )}
            </div>
            <button
              onClick={() => { if (teacherData.length === 3) startTransition(() => { fetchTeachers(page + 1); }); }}
              disabled={teacherData.length < 3 || isPending || isLoading}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >{t.next}</button>
          </div>
        )}

        {/* Qidiruv rejimida natijalar soni */}
        {debouncedQuery && (
          <div className="px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span className="font-semibold text-[#6c35de]">{filteredTeachers.length}</span> ta natija topildi — "<span className="italic">{debouncedQuery}</span>"
          </div>
        )}
      </div>

      <TeacherModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedTeacher(null); }} onSubmit={handleTeacherSubmit} teacherToEdit={selectedTeacher} />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, teacherId: null })}
        onConfirm={() => { const id = deleteConfirm.teacherId; setDeleteConfirm({ isOpen: false, teacherId: null }); if (id) actualDeleteTeacher(id); }}
        title={t.teacherDeleteConfirm}
        message={t.teacherDeleteMsg}
      />
    </div>
  );
}
