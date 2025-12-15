import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockDatabase';
import { Student, AccessLog, ExitRequest, RequestStatus, StudentStatus } from '../../types';
import { Clock, MapPin, Upload, FileText, CheckCircle, XCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  studentId: string;
  onLogout: () => void;
}

const StudentDashboard: React.FC<Props> = ({ studentId, onLogout }) => {
  const [student, setStudent] = useState<Student | undefined | null>(undefined); // null indicates not found
  const [myLogs, setMyLogs] = useState<AccessLog[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'request' | 'history'>('status');
  
  // History Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Request Form State
  const [reason, setReason] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const s = db.students.getById(studentId);
    if (!s) {
      setStudent(null);
    } else {
      setStudent(s);
      setMyLogs(db.logs.getAll().filter(l => l.studentId === studentId));
    }
  }, [studentId]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const newReq: ExitRequest = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      reason,
      dateFrom,
      dateTo,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      proofUrl: 'mock_pdf.pdf' // Simulate upload
    };

    db.requests.add(newReq);
    alert('Request submitted successfully!');
    setReason('');
    setDateFrom('');
    setDateTo('');
    setActiveTab('status'); // Go back to status to see pending maybe?
  };

  if (student === undefined) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  
  if (student === null) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Student Not Found</h2>
        <p className="text-slate-500 mb-6">The ID <span className="font-mono bg-slate-100 px-2 py-1 rounded">{studentId}</span> does not exist in our records.</p>
        <button 
          onClick={onLogout}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  // Pagination Logic for History
  const totalPages = Math.ceil(myLogs.length / itemsPerPage);
  const paginatedLogs = myLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-emerald-400">HostelGuard</h1>
          <button onClick={onLogout} className="text-sm text-slate-300 hover:text-white">Sign Out</button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <img src={student.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">{student.name}</h2>
            <p className="text-slate-500 text-sm">{student.id} • Room {student.room}</p>
            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${student.currentStatus === StudentStatus.IN ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <MapPin size={12} className="mr-1" />
              Currently {student.currentStatus}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1">
          <button 
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'status' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Status
          </button>
          <button 
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'request' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Request Exit
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            History
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'status' && (
          <div className="space-y-4">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
               <h3 className="font-semibold text-blue-800 mb-2">Today's Rules</h3>
               <ul className="text-sm text-blue-700 space-y-1">
                 <li>• Normal Entry: 2:00 PM - 6:00 PM</li>
                 <li>• Late Entry: 6:00 PM - 9:00 PM</li>
                 <li>• Closed: After 9:00 PM</li>
               </ul>
             </div>

             <h3 className="font-semibold text-slate-700">Recent Requests</h3>
             {db.requests.getAll().filter(r => r.studentId === student.id).length === 0 ? (
               <p className="text-slate-400 text-sm italic">No requests submitted.</p>
             ) : (
               db.requests.getAll().filter(r => r.studentId === student.id).map(req => (
                 <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="font-medium text-slate-800">{req.reason}</p>
                       <p className="text-xs text-slate-500">{new Date(req.dateFrom).toLocaleDateString()} - {new Date(req.dateTo).toLocaleDateString()}</p>
                     </div>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                       req.status === RequestStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                       req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                       {req.status}
                     </span>
                   </div>
                   {req.wardenRemarks && (
                     <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                       <span className="font-semibold">Warden:</span> {req.wardenRemarks}
                     </p>
                   )}
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'request' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Submit Exit Request</h3>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reason</label>
                <input required type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" placeholder="e.g. Going home for weekend" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">From</label>
                  <input required type="datetime-local" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">To</label>
                  <input required type="datetime-local" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">Click to upload proof (PDF)</p>
                <p className="text-xs text-slate-400 mt-1">Simulated Upload</p>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700">
                Submit Request
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             {myLogs.length === 0 ? <div className="p-4 text-center text-slate-400">No logs found.</div> : 
             <>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                     <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                     <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                     <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {paginatedLogs.map(log => (
                     <tr key={log.id}>
                       <td className="px-4 py-3 text-sm text-slate-600">{new Date(log.timestamp).toLocaleDateString()} <br/> <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span></td>
                       <td className="px-4 py-3 text-sm font-medium">{log.type}</td>
                       <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${log.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {log.status}
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             {/* Simple Pagination for Mobile */}
             <div className="p-3 bg-slate-50 flex justify-between items-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="p-1.5 bg-white border border-slate-300 rounded disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="p-1.5 bg-white border border-slate-300 rounded disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
             </div>
             </>
             }
           </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;