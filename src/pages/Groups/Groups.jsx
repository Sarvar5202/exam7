import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import { toast } from '../../components/UI/Toast/Toast';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Switch from '@mui/material/Switch';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import GroupModal from "../../components/UI/GroupModal/GroupModal";
import EditGroupSidebar from "../../components/UI/ManagementSidebar/EditGroupSidebar";
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";

export default function Groups() {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, group: null });

  // status undefined yoki null bo'lsa ham FAOL deb hisoblanadi
  const isActive = (status) => status === undefined || status === null || status === true || status === 'active' || status === 'ACTIVE';

  const fetchGroups = () => {
    setIsLoading(true);
    api.get('/groups/all').then(res => setGroups(res.data.data)).catch(err => console.log(err.message)).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const actualDeleteGroup = (id) => {
    api.delete(`/groups/${id}`).then(() => fetchGroups()).catch(err => console.log(err.message));
  };

  const uniqueTeachers = new Set(groups.flatMap(g => g.teachers?.map(t => typeof t === 'object' ? String(t.id || t.full_name || '') : String(t)).filter(Boolean) || []));
  const uniqueStudents = new Set(groups.flatMap(g => g.students?.map(s => typeof s === 'object' ? String(s.id || s.full_name || '') : String(s)).filter(Boolean) || []));

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">Guruhlar</h1>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" /><span>Guruh qo'shish</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a]">Guruhlar ro'yxati va ularning ma'lumotlari.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#6c35de] text-white rounded-lg">
          <GroupsRoundedIcon fontSize="small" />Guruhlar
        </button>
        <button onClick={() => navigate('/dashboard/groups/archive')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArchiveOutlinedIcon fontSize="small" />Arxiv
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <GroupsRoundedIcon />, label: "Jami guruhlar", value: groups.length, color: "bg-blue-50 text-blue-600" },
          { icon: <PersonRoundedIcon />, label: "O'qituvchilar", value: uniqueTeachers.size, color: "bg-orange-50 text-orange-600" },
          { icon: <SchoolRoundedIcon />, label: "O'quvchilar", value: uniqueStudents.size, color: "bg-green-50 text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <MoreVertRoundedIcon className="text-slate-400" fontSize="small" />
            </div>
            <p className="text-sm text-slate-500">{s.label}</p>
            <h2 className="text-2xl font-bold text-slate-900">{s.value}</h2>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s', minHeight: 150 }}>
          {isLoading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}><CircularProgress sx={{ color: '#6c35de' }} /></Box>}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Guruh nomi</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Kurs</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Davomiyligi</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Dars vaqti</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Xona</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">O'qituvchi</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Talabalar</th>
                <th className="text-right px-5 py-3">
                  <RefreshRoundedIcon className="text-slate-400 cursor-pointer hover:text-slate-700 transition-colors" fontSize="small" onClick={fetchGroups} />
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id} onClick={() => navigate(`/dashboard/groups/${group.id}`)} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive(group.status)}
                        size="small"
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                          const newStatus = e.target.checked;
                          setGroups(prev => prev.map(g =>
                            g.id === group.id ? { ...g, status: newStatus } : g
                          ));
                          api.patch(`/groups/${group.id}`, { status: newStatus })
                            .then(() => toast.success(newStatus ? "Guruh faollashtirildi" : "Guruh nofaol qilindi"))
                            .catch(() => {
                              setGroups(prev => prev.map(g =>
                                g.id === group.id ? { ...g, status: !newStatus } : g
                              ));
                              toast.error("Xatolik yuz berdi");
                            });
                        }}
                        sx={{
                          width: 44, height: 24, padding: 0,
                          '& .MuiSwitch-switchBase': {
                            padding: '2px',
                            '&.Mui-checked': {
                              transform: 'translateX(20px)',
                              color: '#fff',
                              '& + .MuiSwitch-track': { backgroundColor: '#22c55e', opacity: 1 }
                            }
                          },
                          '& .MuiSwitch-thumb': { width: 20, height: 20 },
                          '& .MuiSwitch-track': {
                            borderRadius: 12,
                            backgroundColor: '#ef4444',
                            opacity: 1
                          }
                        }}
                      />
                      <span className={`text-xs font-semibold ${isActive(group.status) ? 'text-green-600' : 'text-red-600'}`}>
                        {isActive(group.status) ? 'FAOL' : 'NOFAOL'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{group.name}</td>
                  <td className="px-5 py-3"><span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-xs font-medium">{group.course?.name}</span></td>
                  <td className="px-5 py-3 text-slate-600">{group.course?.duration_month} oy</td>
                  <td className="px-5 py-3">
                    <div><span className="text-slate-800 font-medium">{group.start_time}</span><br /><span className="text-xs text-slate-400">{group.week_day?.map(d => d.toLowerCase().slice(0,3)).join(', ')}</span></div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{group.room}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {group.teachers?.map(t => <span key={t.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{t.full_name}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{group.students?.length}</td>
                  <td className="px-5 py-3 text-right">
                    <MoreVertRoundedIcon className="text-slate-400 cursor-pointer hover:text-slate-700" fontSize="small" onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); setActiveGroup(group); }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => { setAnchorEl(null); setActiveGroup(null); }} onClick={e => e.stopPropagation()} PaperProps={{ sx: { boxShadow: '0 6px 18px rgba(16,24,40,0.08)', border: '1px solid #e6edf6', borderRadius: '8px', padding: '4px', minWidth: '120px' } }}>
        <MenuItem onClick={() => { setEditGroupData(activeGroup); setIsEditOpen(true); setAnchorEl(null); setActiveGroup(null); }} sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#0f172a', fontWeight: 600, fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#f8fafc' } }}>
          <EditRoundedIcon fontSize="small" /><span>Edit</span>
        </MenuItem>
        <MenuItem onClick={() => { setDeleteConfirm({ isOpen: true, group: activeGroup }); setAnchorEl(null); setActiveGroup(null); }} sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#ef4444', fontWeight: 600, fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#fef2f2' } }}>
          <DeleteOutlineRoundedIcon fontSize="small" /><span>Delete</span>
        </MenuItem>
      </Menu>

      <EditGroupSidebar isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditGroupData(null); }} groupData={editGroupData} onSave={opt => { if (opt) setGroups(prev => prev.map(g => g.id === editGroupData?.id ? { ...g, ...opt } : g)); else fetchGroups(); }} />
      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => fetchGroups()} />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, group: null })} onConfirm={() => { const id = deleteConfirm.group?.id; setDeleteConfirm({ isOpen: false, group: null }); if (id) actualDeleteGroup(id); }} title="Guruhni o'chirish" message="Rostdan ham o'chirishni hohlaysizmi?" />
    </div>
  );
}
