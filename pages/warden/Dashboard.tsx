import React, { useEffect, useState } from 'react';
import { db } from '../../services/mockDatabase';
import { StudentStatus, EntryStatus, AccessLog } from '../../types';
import { Users, LogIn, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const WardenDashboard: React.FC = () => {
  const [students, setStudents] = useState(db.students.getAll());
  const [logs, setLogs] = useState(db.logs.getAll());

  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(db.students.getAll());
      setLogs(db.logs.getAll());
    }, 2000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const totalStudents = students.length;
  const insideCount = students.filter(s => s.currentStatus === StudentStatus.IN).length;
  const outsideCount = totalStudents - insideCount;
  
  // Late count (students who entered late today)
  const today = new Date().toDateString();
  const lateCount = logs.filter(l => 
    new Date(l.timestamp).toDateString() === today && 
    (l.status === EntryStatus.LATE || l.status === EntryStatus.VIOLATION)
  ).length;

  const data = [
    { name: 'Inside', value: insideCount, color: '#10b981' },
    { name: 'Outside', value: outsideCount, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <LogIn size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Currently Inside</p>
            <h3 className="text-2xl font-bold text-slate-800">{insideCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <LogOut size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Currently Outside</p>
            <h3 className="text-2xl font-bold text-slate-800">{outsideCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Late Entries (Today)</p>
            <h3 className="text-2xl font-bold text-slate-800">{lateCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="font-semibold text-slate-700 mb-4">Occupancy Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center text-sm text-slate-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-semibold text-slate-700 mb-4">Recent Activity</h3>
          <div className="overflow-y-auto h-64 pr-2 space-y-3">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${log.status === EntryStatus.LATE || log.status === EntryStatus.VIOLATION ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    {log.status === EntryStatus.LATE || log.status === EntryStatus.VIOLATION ? <Clock size={16} /> : <Users size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{log.studentName}</p>
                    <p className="text-xs text-slate-500">{log.studentId} • Block {log.block}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    log.type === 'ENTER' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {log.type}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
