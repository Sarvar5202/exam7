import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Switch from '@mui/material/Switch';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import EditGroupSidebar from "../../components/UI/ManagementSidebar/EditGroupSidebar";
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";

export default function ArchiveGroups() {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, groupId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, groupId: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);

  const isActive = (status) => status === undefined || status === null || status === true || status === 'active' || status === 'ACTIVE';

  const fetchArchivedGroups = () => {
    setIsLoading(true);
    api.get('/groups/archive').then(res => setGroupData(res.data.data || [])).catch(err => console.error(err)).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchArchivedGroups(); }, []);

  const actualRestoreGroup = (id) => {
    setIsLoading(true);
    api.post(`/groups/${id}/restore`).then(() => setGroupData(prev => prev.filter(g => g.id !== id))).catch(err => console.error(err)).finally(() => setIsLoading(false));
  };

  const actualDeleteGroup = (id) => {
    setIsLoading(true);
    api.delete(`/groups/${id}/force`).then(() => setGroupData(prev => prev.filter(g => g.id !== id))).catch(err => console.error(err)).finally(() => setIsLoading(false));
  };

  const handleEdit = (group) => {
    setEditGroupData(group);
    setIsEditOpen(true);
    api.get(`/groups/${group.id}`).then(res => { const f = res.data.data || res.data; if (f) setEditGroupData(prev => ({ ...prev, ...f })); }).catch(console.error);
    setAnchorEl(null); setActiveGroup(null);
  };

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">Guruhlar Arxiv</h1>
          <button onClick={() => navigate('/dashboard/groups')} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <KeyboardArrowLeftRoundedIcon fontSize="small" /><span>Orqaga</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a]">Arxivlangan guruhlar ro'yxati.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => navigate('/dashboard/groups')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <GroupsRoundedIcon fontSize="small" />Guruhlar
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#6c35de] text-white rounded-lg">
          <ArchiveOutlinedIcon fontSize="small" />Arxiv
        </button>
      </div>

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
                  <RefreshRoundedIcon className="text-slate-400 cursor-pointer" fontSize="small" onClick={fetchArchivedGroups} />
                </th>
              </tr>
            </thead>
            <tbody>
              {groupData.map(group => (
                <tr key={group.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive(group.status)}
                        size="small"
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                          const newStatus = e.target.checked;
                          setGroupData(prev => prev.map(g =>
                            g.id === group.id ? { ...g, status: newStatus } : g
                          ));
                          api.patch(`/groups/${group.id}`, { status: newStatus }).catch(() => {
                            setGroupData(prev => prev.map(g =>
                              g.id === group.id ? { ...g, status: !newStatus } : g
                            ));
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
                  <td className="px-5 py-3"><span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-xs font-medium">{group.course?.name || "Kurs yo'q"}</span></td>
                  <td className="px-5 py-3 text-slate-600">{group.courses?.duration_month}oy</td>
                  <td className="px-5 py-3">
                    <div><span className="text-slate-800 font-medium">{group.start_time}</span><br /><span className="text-xs text-slate-400">{group.week_day?.map(d => d.toLowerCase().slice(0,3)).join(', ')}</span></div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{group.rooms?.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {group.teachers?.map(t => <span key={t.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{t.full_name}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{group.students?.length || 0}</td>
                  <td className="px-5 py-3 text-right">
                    <MoreVertRoundedIcon className="text-slate-400 cursor-pointer hover:text-slate-700" fontSize="small" onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); setActiveGroup(group); }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => { setAnchorEl(null); setActiveGroup(null); }} PaperProps={{ sx: { boxShadow: '0 6px 18px rgba(16,24,40,0.08)', border: '1px solid #e6edf6', borderRadius: '8px', padding: '4px', minWidth: '120px' } }}>
        <MenuItem onClick={() => { setRestoreConfirm({ isOpen: true, groupId: activeGroup?.id }); setAnchorEl(null); setActiveGroup(null); }} sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#0f172a', fontWeight: 600, fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#f8fafc' } }}>
          <RestoreOutlinedIcon fontSize="small" /><span>Restore</span>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(activeGroup)} sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: '#0f172a', fontWeight: 600, fontSize: '14px', borderRadius: '6px', '&:hover': { backgroundColor: '#f8fafc' } }}>
          <EditRoundedIcon fontSize="small" /><span>Edit</span>
        </MenuItem>
      </Menu>

      <EditGroupSidebar isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditGroupData(null); }} groupData={editGroupData} onSave={() => fetchArchivedGroups()} />
      <ConfirmDialog isOpen={restoreConfirm.isOpen} onClose={() => setRestoreConfirm({ isOpen: false, groupId: null })} onConfirm={() => { const id = restoreConfirm.groupId; setRestoreConfirm({ isOpen: false, groupId: null }); if (id) actualRestoreGroup(id); }} title="Restore Group" message="Are you sure you want to restore this group?" />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, groupId: null })} onConfirm={() => { const id = deleteConfirm.groupId; setDeleteConfirm({ isOpen: false, groupId: null }); if (id) actualDeleteGroup(id); }} title="Delete Group Forever" message="This will permanently delete the archived group. Continue?" />
    </div>
  );
}
