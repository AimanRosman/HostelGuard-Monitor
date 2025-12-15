import React, { useState, useMemo } from 'react';
import { db } from '../../services/mockDatabase';
import { AccessLog, EntryStatus } from '../../types';
import { Search, Calendar, Filter, AlertTriangle, AlertOctagon, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

type DateFilter = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'ALL';

const LateEntries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('TODAY');
  const [logs] = useState<AccessLog[]>(db.logs.getAll());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter Logic
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const results = logs.filter(log => {
      // 1. Must be a "Late" type status
      const isLateType = 
        log.status === EntryStatus.LATE || 
        log.status === EntryStatus.VIOLATION || 
        log.status === EntryStatus.APPROVED_LATE;

      if (!isLateType) return false;

      // 2. Text Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.studentName.toLowerCase().includes(searchLower) ||
        log.studentId.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;

      // 3. Date Filter
      const logTime = new Date(log.timestamp).getTime();
      
      switch (dateFilter) {
        case 'TODAY':
          return logTime >= todayStart;
        case 'YESTERDAY':
          const yesterdayStart = todayStart - 86400000;
          return logTime >= yesterdayStart && logTime < todayStart;
        case 'LAST_7_DAYS':
          return logTime >= (todayStart - (86400000 * 7));
        case 'LAST_30_DAYS':
          return logTime >= (todayStart - (86400000 * 30));
        case 'ALL':
        default:
          return true;
      }
    });
    return results;
  }, [logs, searchTerm, dateFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStudentPhoto = (id: string) => {
    return db.students.getById(id)?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${id}`;
  };

  const getStatusBadge = (status: EntryStatus) => {
    switch (status) {
      case EntryStatus.LATE:
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200"><AlertTriangle size={12}/> Late</span>;
      case EntryStatus.VIOLATION:
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><AlertOctagon size={12}/> Violation</span>;
      case EntryStatus.APPROVED_LATE:
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200"><CheckCircle2 size={12}/> Approved</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Late Entries Management</h2>
          <p className="text-slate-500">Monitor and review students entering after curfew.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400" size={18} />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="flex-1 md:w-48 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="ALL">All History</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Student</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Time Recorded</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Block / Room</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Remarks</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Calendar size={32} className="opacity-20" />
                    <span>No late entries found for this period.</span>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const student = db.students.getById(log.studentId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getStudentPhoto(log.studentId)} 
                            alt={log.studentName} 
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{log.studentName}</p>
                            <p className="text-xs text-slate-500 font-mono">{log.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        Block {log.block} • {student?.room || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic">
                        {log.remarks || "No remarks"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {paginatedLogs.length} of {filteredLogs.length} records</span>
            <div className="flex gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               <ChevronLeft size={16} />
             </button>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages || totalPages === 0}
               className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
             >
               <ChevronRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LateEntries;