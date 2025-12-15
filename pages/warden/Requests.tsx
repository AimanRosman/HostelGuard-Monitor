import React, { useState } from 'react';
import { db } from '../../services/mockDatabase';
import { ExitRequest, RequestStatus } from '../../types';
import { Search, FileText, Check, X, Filter, Calendar } from 'lucide-react';

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<ExitRequest[]>(db.requests.getAll());
  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [search, setSearch] = useState('');

  const handleStatusUpdate = (id: string, newStatus: RequestStatus) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      const updated = { ...request, status: newStatus, wardenRemarks: newStatus === RequestStatus.REJECTED ? 'Rejected by Warden' : 'Approved' };
      db.requests.update(updated);
      setRequests(db.requests.getAll()); // Refresh
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    const matchesSearch = req.studentName.toLowerCase().includes(search.toLowerCase()) || req.studentId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case RequestStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Exit Requests</h2>
          <p className="text-slate-500">Manage student leave and exit permissions</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="text-slate-400" size={18} />
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
             <button
               key={status}
               onClick={() => setFilter(status as any)}
               className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                 filter === status 
                   ? 'bg-slate-800 text-white' 
                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
               }`}
             >
               {status}
             </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <img src={db.students.getById(req.studentId)?.photoUrl} className="w-10 h-10 rounded-full bg-slate-100" alt="" />
                 <div>
                   <h3 className="font-bold text-slate-800">{req.studentName}</h3>
                   <p className="text-xs text-slate-500">{req.studentId}</p>
                 </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Reason</p>
                <p className="text-sm text-slate-700 font-medium">{req.reason}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-emerald-500" />
                <span>{new Date(req.dateFrom).toLocaleDateString()}</span>
                <span className="text-slate-300">→</span>
                <span>{new Date(req.dateTo).toLocaleDateString()}</span>
              </div>
              {req.proofUrl && (
                <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
                  <FileText size={16} />
                  <span>View Proof Document</span>
                </div>
              )}
            </div>

            {req.status === RequestStatus.PENDING && (
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => handleStatusUpdate(req.id, RequestStatus.REJECTED)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
                >
                  <X size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleStatusUpdate(req.id, RequestStatus.APPROVED)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            )}
            {req.status !== RequestStatus.PENDING && (
              <div className="mt-auto pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                Processed on {new Date().toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No requests found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;