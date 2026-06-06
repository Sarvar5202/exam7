import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const thCls = "text-left px-4 py-3 font-semibold text-slate-500 text-xs";
const tdCls = "px-4 py-3 text-sm text-slate-700";

const getHomeworkId = (lesson) =>
  lesson?.homework?.[0]?.id ??
  lesson?.homework_id ??
  lesson?.homeworkId ??
  lesson?.homework?.id ??
  lesson?.homework?.homework_id ??
  lesson?.id;

export default function UygaVazifa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homeworkData, setHomeworkData] = useState([]);
  const fetchedRef = useRef(false);

  const formatDate = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "-";
    const months = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  };
  const formatDateTime = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "-";
    return `${formatDate(s)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  useEffect(() => {
    if (id && !fetchedRef.current) {
      fetchedRef.current = true;
      api.get(`/homework/${id}`).then(res => {
        const data = res.data.data || res.data || [];
        setHomeworkData(Array.isArray(data) ? data : [data]);
      }).catch(err => { console.error(err); fetchedRef.current = false; });
    }
  }, [id]);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <th className={thCls}>#</th>
          <th className={thCls}>Mavzu</th>
          <th className={thCls}><PersonOutlineRoundedIcon fontSize="small" className="text-slate-400" /></th>
          <th className={thCls}><TimerOutlinedIcon fontSize="small" className="text-amber-400" /></th>
          <th className={thCls}><CheckCircleOutlineRoundedIcon fontSize="small" className="text-green-500" /></th>
          <th className={thCls}>Berilgan vaqt</th>
          <th className={thCls}>Tugash vaqti</th>
          <th className={thCls}>Dars sanasi</th>
          <th className={thCls}></th>
        </tr>
      </thead>
      <tbody>
        {homeworkData.map((lesson, idx) => (
          <tr key={`${lesson.id}-${idx}`} onClick={() => navigate(`/dashboard/groups/${id}/homework/${getHomeworkId(lesson)}/results`)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
            <td className={tdCls}>{idx + 1}</td>
            <td className={tdCls}>
              {lesson.homeworkPending > 0 ? (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{lesson.topic}</span>
              ) : (
                <span className="font-medium text-slate-800">{lesson.topic}</span>
              )}
            </td>
            <td className={tdCls}>{lesson.existStudentsIngroup || 0}</td>
            <td className={tdCls}>{lesson.homeworkPending || 0}</td>
            <td className={tdCls}>{lesson.homeworkAccept || 0}</td>
            <td className={tdCls + " text-slate-500"}>{formatDateTime(lesson.created_at)}</td>
            <td className={tdCls + " text-slate-500"}>{formatDateTime(lesson.deadline ?? lesson.end_date ?? lesson.due_date)}</td>
            <td className={tdCls + " text-slate-500"}>{formatDate(lesson.lesson_date ?? lesson.created_at)}</td>
            <td className={tdCls}><MoreVertRoundedIcon className="text-slate-400" fontSize="small" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
