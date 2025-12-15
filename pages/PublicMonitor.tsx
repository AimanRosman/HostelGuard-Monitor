import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockDatabase';
import { AccessLog, LogType, EntryStatus } from '../types';
import { Radio, ShieldCheck, User, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PublicMonitor: React.FC = () => {
  const navigate = useNavigate();
  
  // Data State
  const [allLogs, setAllLogs] = useState<AccessLog[]>([]);
  
  // Search State
  const [recentSearch, setRecentSearch] = useState('');
  const [lateSearch, setLateSearch] = useState('');
  
  // Pagination State
  const [recentPage, setRecentPage] = useState(1);
  const recentItemsPerPage = 15;

  const [latePage, setLatePage] = useState(1);
  const lateItemsPerPage = 25;

  useEffect(() => {
    // Poll for data
    const refreshData = () => {
      setAllLogs(db.logs.getAll());
    };

    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setLatePage(1);
  }, [lateSearch]);

  useEffect(() => {
    setRecentPage(1);
  }, [recentSearch]);

  const getStudentPhoto = (id: string) => {
    return db.students.getById(id)?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${id}`;
  };

  // --- DERIVED STATE ---

  // 1. Recent Activity Logic: Filter then Paginate
  const filteredRecentLogs = allLogs.filter(log => 
    recentSearch === '' || 
    log.studentName.toLowerCase().includes(recentSearch.toLowerCase()) ||
    log.studentId.toLowerCase().includes(recentSearch.toLowerCase()) ||
    log.block.toLowerCase().includes(recentSearch.toLowerCase())
  );

  const totalRecentPages = Math.max(1, Math.ceil(filteredRecentLogs.length / recentItemsPerPage));
  const currentRecentLogs = filteredRecentLogs.slice(
    (recentPage - 1) * recentItemsPerPage,
    recentPage * recentItemsPerPage
  );

  // 2. Late Watch Logic: Filter by Status + Today + Search -> Paginate
  const today = new Date().toDateString();
  const allLateLogsToday = allLogs.filter(l => 
    (l.status === EntryStatus.LATE || l.status === EntryStatus.VIOLATION || l.status === EntryStatus.APPROVED_LATE) &&
    new Date(l.timestamp).toDateString() === today
  );

  const filteredLateLogs = allLateLogsToday.filter(log => 
    lateSearch === '' ||
    log.studentName.toLowerCase().includes(lateSearch.toLowerCase()) ||
    log.studentId.toLowerCase().includes(lateSearch.toLowerCase())
  );

  const totalLatePages = Math.max(1, Math.ceil(filteredLateLogs.length / lateItemsPerPage));
  const currentLateLogs = filteredLateLogs.slice(
    (latePage - 1) * lateItemsPerPage,
    latePage * lateItemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Radio className="text-white animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HostelGuard <span className="text-emerald-400 font-light">Live Monitor</span></h1>
              <p className="text-xs text-slate-400">System Active • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/login?role=student')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors text-slate-200 flex items-center gap-2"
            >
              <User size={16} /> Student Portal
            </button>
            <button 
              onClick={() => navigate('/login?role=warden')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors text-white flex items-center gap-2 shadow-lg"
            >
              <ShieldCheck size={16} /> Warden Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Traffic Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[800px] flex flex-col">
            
            {/* Recent Activity Header with Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
               <div className="flex items-center gap-2">
                   <h2 className="font-bold text-slate-700 flex items-center gap-2">
                     <Radio size={18} className="text-emerald-500" /> Recent Activity
                   </h2>
                   <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-white rounded border border-slate-200">LIVE</span>
               </div>
               <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                   <input 
                     type="text" 
                     placeholder="Search logs..." 
                     value={recentSearch}
                     onChange={(e) => setRecentSearch(e.target.value)}
                     className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                   />
               </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 bg-slate-50 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRecentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={getStudentPhoto(log.studentId)} alt="" className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                           <div>
                            <div className="font-medium text-slate-900">{log.studentName}</div>
                            <div className="text-xs text-slate-500">{log.studentId} • {log.block}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                           log.type === LogType.ENTER 
                             ? 'bg-emerald-100 text-emerald-700' 
                             : 'bg-indigo-100 text-indigo-700'
                         }`}>
                           {log.type === LogType.ENTER ? 'IN' : 'OUT'}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         {log.status === EntryStatus.NORMAL ? (
                           <span className="text-slate-400 text-sm font-medium">Normal</span>
                         ) : (
                           <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                             log.status === EntryStatus.LATE || log.status === EntryStatus.VIOLATION
                               ? 'bg-red-100 text-red-700 border-red-200'
                               : 'bg-blue-100 text-blue-700 border-blue-200'
                           }`}>
                             {log.status === EntryStatus.VIOLATION && <AlertTriangle size={12} />}
                             {log.status.replace('_', ' ')}
                           </span>
                         )}
                      </td>
                    </tr>
                  ))}
                  {currentRecentLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        {recentSearch ? 'No matching logs found.' : 'Waiting for activity...'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Activity Pagination */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button 
                 disabled={recentPage === 1}
                 onClick={() => setRecentPage(p => p - 1)}
                 className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs text-slate-500 font-medium">Page {recentPage} of {totalRecentPages}</span>
              <button 
                 disabled={recentPage === totalRecentPages}
                 onClick={() => setRecentPage(p => p + 1)}
                 className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Late Watch */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
          
          {/* Late Watch Header with Search */}
          <div className="p-4 bg-red-50 border-b border-red-100 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-red-800 flex items-center gap-2">
                <Clock size={20} /> Late Watch
              </h2>
              <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                {allLateLogsToday.length} Today
              </span>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-red-300" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter late list..." 
                  value={lateSearch}
                  onChange={(e) => setLateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-red-200 focus:ring-2 focus:ring-red-500 outline-none bg-white placeholder-red-200 text-red-800"
                />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
             {currentLateLogs.length === 0 ? (
               <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                   <CheckCircle size={32} />
                 </div>
                 <p className="text-slate-600 font-medium">All clear!</p>
                 <p className="text-sm text-slate-400">{lateSearch ? 'No matches found.' : 'No late entries recorded today.'}</p>
               </div>
             ) : (
               currentLateLogs.map(log => (
                 <div key={log.id} className="p-4 hover:bg-red-50/30 transition-colors flex items-start gap-3">
                   <img src={getStudentPhoto(log.studentId)} className="w-10 h-10 rounded-full border border-red-100 object-cover" alt="" />
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                       <p className="font-bold text-slate-800 truncate">{log.studentName}</p>
                       <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-2">
                         {log.status.replace('_', ' ')}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 mb-1">{log.studentId} • {log.block}</p>
                     <div className="flex gap-2 text-xs">
                       <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                         <Clock size={10} />
                         {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
          
          {/* Late Watch Pagination */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
            <button 
               disabled={latePage === 1}
               onClick={() => setLatePage(p => p - 1)}
               className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs text-slate-500 font-medium">Page {latePage} of {totalLatePages}</span>
            <button 
               disabled={latePage === totalLatePages}
               onClick={() => setLatePage(p => p + 1)}
               className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicMonitor;