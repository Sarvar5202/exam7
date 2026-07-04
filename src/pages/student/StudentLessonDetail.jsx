import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getMyGroupLessons, getLessonVideos, getLessonHomeworks, submitHomeworkAnswer, getMyGroups } from '../../api/studentApi';
import { getVideoUrlFromResponse } from '../../utils/videoUtils';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function StudentLessonDetail() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { dark, lang } = useApp();
  
  const [lessons, setLessons] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [teacherHomework, setTeacherHomework] = useState(null);
  const [myHomework, setMyHomework] = useState(null);
  const [teacherResult, setTeacherResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const leftPanelRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = 0;
    }
  }, [lessonId]);

  // Group Teacher Name for reviewer fallback
  const [groupTeacher, setGroupTeacher] = useState('');

  // Inline Submission State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const MAX_CHARS = 1000;
  
  const bg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#8888aa' : '#64748b';

  const loadHomeworks = async () => {
    try {
      const hwRes = await getLessonHomeworks(id, lessonId);
      const hwData = hwRes.data?.data || hwRes.data;
      if (hwData && typeof hwData === 'object' && !Array.isArray(hwData)) {
         setTeacherHomework(hwData.homework || null);
         setMyHomework(hwData.answer || null);
         setTeacherResult(hwData.result || null);
      } else if (Array.isArray(hwData)) {
         setTeacherHomework(hwData[0]?.homework || hwData[0] || null);
         setMyHomework(hwData[0]?.answer || null);
         setTeacherResult(hwData[0]?.result || null);
      }
    } catch(e) {
      setTeacherHomework(null);
      setMyHomework(null);
      setTeacherResult(null);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getMyGroupLessons(id);
        const data = res.data?.data || res.data || [];
        const lessonsArray = Array.isArray(data) ? data : [];
        setLessons(lessonsArray);

        // Fetch Group details to get teacher name
        try {
          const groupsRes = await getMyGroups();
          const groupsData = groupsRes.data?.data || groupsRes.data || [];
          const currentGroup = groupsData.find(g => String(g.groupId || g.id) === String(id));
          if (currentGroup?.teachers && currentGroup.teachers.length > 0) {
            setGroupTeacher(currentGroup.teachers[0].full_name || currentGroup.teachers[0].name || '');
          }
        } catch (e) { console.error(e); }

        if (lessonId) {
          // Fetch video
          try {
            const vRes = await getLessonVideos(id, lessonId);
            const vData = vRes.data?.data || vRes.data;
            const videoUrlFromApi = getVideoUrlFromResponse(vData);
            setVideoUrl(videoUrlFromApi);
          } catch(e) { 
            setVideoUrl(''); 
          }

          await loadHomeworks();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id, lessonId]);

  const activeLesson = lessons.find(l => String(l.id || lessons.indexOf(l)) === String(lessonId)) || lessons[0];

  function formatTimeDate(dStr) {
    if (!dStr) return '';
    try {
      const dd = new Date(dStr);
      const months = lang === 'uz'
        ? ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
        : ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const time = `${dd.getHours().toString().padStart(2, '0')}:${dd.getMinutes().toString().padStart(2, '0')}`;
      return `${time} ${dd.getDate()} ${months[dd.getMonth()]}, ${dd.getFullYear()}`;
    } catch { return dStr; }
  }

  function formatDateTime(dStr) {
    if (!dStr) return '';
    try {
      const dd = new Date(dStr);
      const months = lang === 'uz'
        ? ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
        : ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const time = `${dd.getHours().toString().padStart(2, '0')}:${dd.getMinutes().toString().padStart(2, '0')}`;
      return `${dd.getDate()} ${months[dd.getMonth()]}, ${dd.getFullYear()} ${time}`;
    } catch { return dStr; }
  }

  const getStatusDisplay = () => {
    if (!teacherResult) return null;
    const status = teacherResult.status || 'PENDING';
    if (status === 'ACCEPTED') return { text: lang === 'uz' ? 'Vazifa qabul qilindi' : 'Задание принято', textClass: 'text-[#22c55e]' };
    if (status === 'REJECTED') return { text: lang === 'uz' ? 'Vazifa bekor qilindi' : 'Задание отклонено', textClass: 'text-[#ef4444]' };
    if (status === 'CHECKED') return { text: lang === 'uz' ? 'Tekshirildi' : 'Проверено', textClass: 'text-[#3b82f6]' };
    return { text: lang === 'uz' ? 'Kutilmoqda' : 'В ожидании', textClass: 'text-[#f59e0b]' };
  };

  async function handleSubmitHomework() {
    if ((!uploadFile && !uploadTitle.trim()) || !teacherHomework?.id) return;
    if (uploadTitle.length > MAX_CHARS) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', uploadTitle.trim() || 'Homework');
      if (uploadFile) fd.append('file', uploadFile);
      await submitHomeworkAnswer(teacherHomework.id, fd);
      setUploadFile(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadHomeworks();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const teacherDescription = teacherHomework?.description || teacherHomework?.title || 'Vazifa ta`rifi kiritilmagan';
  const submissionText = myHomework?.link || myHomework?.title || myHomework?.comment || myHomework?.description || 'Ma`lumot kiritilmagan';
  const isSubmissionUrl = submissionText.startsWith('http');
  const statusDisplay = getStatusDisplay();
  const reviewerName = teacherResult?.checked_by?.full_name || teacherResult?.checked_by || groupTeacher || "Muxammedaliy +++Ametov";
  const teacherComment = teacherResult?.title || teacherResult?.comment || teacherResult?.description || "Izoh yo'q";

  return (
    <div className="pt-4 flex flex-col lg:flex-row lg:h-[calc(100vh-100px)] min-h-0 w-full lg:overflow-hidden">
      
      {/* Left Content (Video + Comments + Tasks) */}
      <div ref={leftPanelRef} className="flex-shrink-0 w-full lg:w-[65%] xl:w-[70%] min-w-0 min-h-0 flex flex-col gap-4 lg:pr-4 lg:overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
        
        {/* Video Player */}
        <div className="flex-shrink-0 w-full" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
            {videoUrl ? (
              <video 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                src={videoUrl}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              style={{ 
                display: videoUrl ? 'none' : 'flex', 
                position: 'absolute', inset: 0, 
                alignItems: 'center', justifyItems: 'center', justifyContent: 'center', 
                color: '#fff', fontSize: '1rem', flexDirection: 'column', gap: 8
              }}
            >
              <p>Video yuklanmadi yoki ruxsat yo'q</p>
              <span className="text-xs text-gray-400">({videoUrl ? videoUrl.split('/').pop() : 'Fayl topilmadi'})</span>
            </div>
          </div>
        </div>

        {/* File name box */}
        <div className="flex-shrink-0" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '20px' }}>
          <p style={{ color: textMain, fontWeight: 500, fontSize: '1rem' }}>
            {activeLesson?.topic || activeLesson?.title || 'Dars'} {videoUrl ? `(${videoUrl.split('/').pop()})` : ''}
          </p>
        </div>

        {/* Tasks (Vazifalar) Box */}
        <div className="flex flex-col" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8 }}>
          
          {/* FIXED HEADER */}
          <div className="flex items-center justify-between border-b pb-2 pt-5 px-6 flex-shrink-0" style={{ borderColor: border }}>
            <div className="flex">
              <h3 className="pb-2 border-b-[3px]" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#c26415', borderColor: '#c26415', marginBottom: '-10px' }}>
                Vazifalar
              </h3>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c26415' }}>
              Ball: {teacherResult?.grade ?? teacherResult?.score ?? teacherResult?.ball ?? 0}
            </span>
          </div>
          
          {/* SCROLLABLE CONTENT */}
          <div 
            className="flex flex-col" 
            style={{ padding: '20px' }}
          >
            <div className="flex flex-col gap-5">
            
            {/* Uyga vazifa block (Teacher) */}
            {teacherHomework ? (
              <div className="px-8 py-6 rounded-md flex flex-col" style={{ background: '#f8f5f0' }}>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[1.15rem] text-[#374151]" style={{fontWeight: 600}}>Uyga vazifa</h4>
                  {teacherHomework.deadline && (
                    <div className="text-white text-[0.85rem] px-4 py-2 rounded-md flex items-center gap-2" style={{ background: '#e8542a' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Uyga vazifa muddati: {formatDateTime(teacherHomework.deadline)}
                    </div>
                  )}
                  <span className="text-[0.95rem] text-[#4b5563]">
                    Fayllar soni: {teacherHomework.file_url || teacherHomework.file ? 1 : 0}
                  </span>
                </div>
                
                <div className="text-[0.95rem] text-[#4b5563] leading-[2] whitespace-pre-wrap">
                  {teacherDescription}
                </div>
                
                {teacherHomework.created_at && (
                  <div className="text-right text-[0.95rem] text-[#4b5563] mt-8">
                    {formatTimeDate(teacherHomework.created_at)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic px-2">Ustoz tomonidan vazifa biriktirilmagan.</div>
            )}

            {/* Mening jo'natmalarim block (Student) */}
            {myHomework ? (
              <div className="px-8 py-6 rounded-md flex flex-col" style={{ background: '#f8f5f0' }}>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[1.15rem] text-[#374151]" style={{fontWeight: 400}}>Mening jo'natmalarim</h4>
                  <span className="text-[0.95rem] text-[#4b5563]">Fayllar soni: {myHomework.file_url || myHomework.file ? 1 : 0}</span>
                </div>
                
                <div className="text-[0.95rem] break-all">
                  {isSubmissionUrl ? (
                    <a href={submissionText} target="_blank" rel="noreferrer" className="text-[#4b5563] hover:underline">
                      {submissionText}
                    </a>
                  ) : (
                    <span className="text-[#4b5563] whitespace-pre-wrap">{submissionText}</span>
                  )}
                  {/* Fayl mavjud bo'lsa uni ham ko'rsatish */}
                  {(myHomework.file_url || myHomework.file) && (
                     <div className="mt-2">
                       <a href={myHomework.file_url || myHomework.file} target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline flex items-center gap-1">
                         📎 Yuklangan faylni ko'rish
                       </a>
                     </div>
                  )}
                </div>
                
                {myHomework.created_at && (
                  <div className="text-right text-[0.95rem] text-[#4b5563] mt-8">
                    {formatTimeDate(myHomework.created_at)}
                  </div>
                )}
              </div>
            ) : (
              teacherHomework && (
                <div className="rounded-lg" style={{ border: `1px solid ${dark ? '#2a2a3a' : '#e5e7eb'}`, background: dark ? '#16161f' : '#fff' }}>
                  {/* File chip preview */}
                  {uploadFile && (
                    <div className="flex items-center gap-2 px-4 pt-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.82rem]" style={{ background: dark ? '#1e1e2a' : '#f3f4f6', color: textMain }}>
                        <span>📎</span>
                        <span className="max-w-[200px] truncate">{uploadFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="ml-1 hover:opacity-70 transition-opacity"
                          style={{ color: textSub, fontSize: '1rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-end gap-2 p-3">
                    <textarea
                      value={uploadTitle}
                      onChange={e => { if (e.target.value.length <= MAX_CHARS) setUploadTitle(e.target.value); }}
                      placeholder={lang === 'uz' ? 'Fayl biriktiring va izoh qoldiring' : 'Прикрепите файл и оставьте комментарий'}
                      rows={1}
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      style={{
                        flex: 1, resize: 'none', border: 'none', outline: 'none', 
                        background: 'transparent', color: textMain, fontSize: '0.9rem',
                        lineHeight: 1.5, padding: '6px 8px', minHeight: '36px', maxHeight: '120px',
                        overflow: 'auto',
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      style={{ display: 'none' }}
                      onChange={e => setUploadFile(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title={lang === 'uz' ? 'Fayl biriktirish' : 'Прикрепить файл'}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', 
                        color: textSub, padding: '4px', display: 'flex', alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c26415'}
                      onMouseLeave={e => e.currentTarget.style.color = textSub}
                    >
                      <AttachFileRoundedIcon style={{ fontSize: '1.3rem' }} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitHomework}
                      disabled={uploading || (!uploadFile && !uploadTitle.trim()) || uploadTitle.length > MAX_CHARS}
                      title={lang === 'uz' ? 'Yuborish' : 'Отправить'}
                      style={{ 
                        background: 'none', border: 'none', 
                        cursor: (uploading || (!uploadFile && !uploadTitle.trim())) ? 'not-allowed' : 'pointer', 
                        color: (uploading || (!uploadFile && !uploadTitle.trim())) ? (dark ? '#444' : '#ccc') : '#c26415', 
                        padding: '4px', display: 'flex', alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                    >
                      <SendRoundedIcon style={{ fontSize: '1.3rem' }} />
                    </button>
                  </div>
                  <div className="text-right px-4 pb-2" style={{ fontSize: '0.78rem', color: uploadTitle.length > MAX_CHARS ? '#ef4444' : textSub }}>
                    {uploadTitle.length} / {MAX_CHARS}
                  </div>
                </div>
              )
            )}

            {/* O'qituvchi izohi block (Teacher Feedback) */}
            {teacherResult && (
              <div className="px-8 py-6 rounded-md flex flex-col" style={{ background: '#f8f5f0' }}>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[1.15rem] text-[#374151]" style={{fontWeight: 400}}>O'qituvchi izohi</h4>
                  {statusDisplay && (
                    <span className={`text-[0.95rem] ${statusDisplay.textClass}`} style={{fontWeight: 400}}>
                      {statusDisplay.text}
                    </span>
                  )}
                </div>
                
                <div className="text-[0.95rem] text-[#4b5563] leading-[1.8] whitespace-pre-wrap">
                  {teacherComment}
                </div>
                
                <div className="text-[0.95rem] text-[#4b5563] mt-6">
                  Tekshiruvchi: {reviewerName}
                </div>
                
                {(teacherResult.updated_at || teacherResult.created_at) && (
                  <div className="text-right text-[0.95rem] text-[#4b5563] mt-4">
                    {formatTimeDate(teacherResult.updated_at || teacherResult.created_at)}
                  </div>
                )}
              </div>
            )}
            
            
            {/* Resubmit status text */}
            {myHomework && teacherResult && (
              <div className="text-center mt-2 mb-4 text-[#4b5563] text-[1rem]">
                {lang === 'uz' ? 'Qayta topshirish imkoniyati berilmagan' : 'Возможность повторной сдачи не предоставлена'}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>

      {/* Right Sidebar (Lesson List) */}
      <div className="flex-1 flex flex-col lg:overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar lg:h-full min-h-0 lg:pl-4 lg:pr-2" style={{ scrollbarGutter: 'stable' }}>
        <div className="flex flex-col gap-3">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: textSub }}>Yuklanmoqda...</div>
          ) : (
            lessons.map((lesson, idx) => {
              const lid = String(lesson.id || idx);
              const isActive = lid === String(lessonId);
              
              const topic = lesson?.topic || lesson?.title || lesson?.name || `Mavzu ${idx + 1}`;
              let dDate = lesson?.created_at?.slice(0, 10) || lesson?.date || '';
              if (dDate) {
                try {
                  const dd = new Date(dDate);
                  const months = ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sent', 'Okt', 'Noy', 'Dek'];
                  dDate = `${dd.getDate()} ${months[dd.getMonth()].toLowerCase()}, ${dd.getFullYear()}`;
                } catch(e) {}
              }

              return (
                <div 
                  key={lid} 
                  className={`rounded-xl overflow-hidden cursor-pointer transition-all flex-shrink-0 ${isActive ? 'sticky top-0 z-10 shadow-md' : ''}`}
                  style={{ 
                    background: isActive ? '#eac99e' : '#fcfbf8',
                  }}
                  onClick={() => {
                    if (!isActive) navigate(`/student/groups/${id}/lesson/${lid}`);
                  }}
                >
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold mb-1" style={{ color: isActive ? '#000' : '#000', fontSize: '0.95rem' }}>
                        {topic}
                      </h4>
                      <p style={{ color: isActive ? '#6b573a' : textSub, fontSize: '0.8rem' }}>
                        Dars sanasi: {dDate || '17 iyun, 2026'}
                      </p>
                    </div>
                    <div style={{ color: isActive ? '#000' : textSub }}>
                      {isActive ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isActive && (
                    <div className="px-4 pb-4">
                      <div className="px-4 py-3 rounded-lg flex items-center gap-3" style={{ background: '#deba8d', color: '#5e4828' }}>
                        <PlayCircleOutlineRoundedIcon fontSize="small" />
                        <span className="font-medium text-[0.95rem]">
                          1-video: {videoUrl ? videoUrl.split('/').pop() : 'Fayl yo\'q'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>


    </div>
  );
}
