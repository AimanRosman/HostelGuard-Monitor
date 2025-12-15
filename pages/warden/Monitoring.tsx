import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockDatabase';
import { AccessLog, LogType, EntryStatus } from '../../types';
import { Search, Radio, CheckCircle, XCircle, AlertOctagon, UserPlus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const Monitoring: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [rfidInput, setRfidInput] = useState('');
  const [lastAction, setLastAction] = useState<{message: string, success: boolean} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchLogs = () => {
    setLogs(db.logs.getAll());
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Polling every 5s instead of 2s to reduce jitter while searching
    return () => clearInterval(interval);
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    const result = db.processScan(rfidInput.trim(), true); 
    setLastAction({ message: result.message, success: result.success });
    setRfidInput('');
    
    // Refresh immediately to show new log
    fetchLogs();
    setCurrentPage(1); // Reset to first page to see new entry
    
    setTimeout(() => setLastAction(null), 3000);
  };

  const getStatusColor = (status: EntryStatus) => {
    switch (status) {
      case EntryStatus.LATE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case EntryStatus.DENIED: 
      case EntryStatus.VIOLATION: return 'bg-red-100 text-red-700 border-red-200';
      case EntryStatus.APPROVED_LATE: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  // Filter & Pagination Logic
  const filteredLogs = logs.filter(log => 
    log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Radio className="text-emerald-500" /> Live Monitoring
          </h2>
          <p className="text-slate-500">Real-time entry and exit logs ({logs.length} Total)</p>
        </div>

        {/* Manual Entry Input */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full md:w-96">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Manual Log Entry</h3>
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Enter Student ID (e.g. S001)"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <UserPlus className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 whitespace-nowrap text-sm">
              Log
            </button>
          </form>
          {lastAction && (
            <div className={`mt-2 text-xs p-2 rounded flex items-center gap-2 ${lastAction.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {lastAction.success ? <CheckCircle size={14}/> : <XCircle size={14}/>}
              {lastAction.message}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar for Table */}
      <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-md">
        <Search className="text-slate-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Search logs by name, ID, or block..." 
          className="flex-1 outline-none text-sm text-slate-700 p-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
           <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 mr-2">
             <XCircle size={16} />
           </button>
        )}
      </div>

      {/* Live Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Timestamp</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Student</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Action</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {searchTerm ? 'No logs found matching your search.' : 'No activity recorded yet.'}
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-600 font-mono text-sm">
                      {new Date(log.timestamp).toLocaleTimeString()} <span className="text-slate-400 text-xs ml-1">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{log.studentName}</p>
                        <p className="text-xs text-slate-500">{log.studentId} • Block {log.block}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         log.type === LogType.ENTER ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                       }`}>
                         {log.type}
                       </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status === EntryStatus.VIOLATION && <AlertOctagon size={12} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {log.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
           <span className="text-sm text-slate-500">
             Page {currentPage} of {totalPages || 1} <span className="text-slate-400">({filteredLogs.length} records)</span>
           </span>
           <div className="flex gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
             >
               <ChevronLeft size={16} />
             </button>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages || totalPages === 0}
               className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
             >
               <ChevronRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;