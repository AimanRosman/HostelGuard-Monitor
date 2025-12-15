import React, { useState } from 'react';
import { db } from '../../services/mockDatabase';
import { StudentStatus } from '../../types';
import { Search, MapPin, Phone, User, Filter } from 'lucide-react';

const Students: React.FC = () => {
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('ALL');
  const [students] = useState(db.students.getAll());

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = blockFilter === 'ALL' || s.block === blockFilter;
    return matchesSearch && matchesBlock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-slate-500">View and manage student details</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                In: {students.filter(s => s.currentStatus === StudentStatus.IN).length}
            </span>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                Out: {students.filter(s => s.currentStatus === StudentStatus.OUT).length}
            </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400" size={18} />
          <select 
            value={blockFilter} 
            onChange={(e) => setBlockFilter(e.target.value)}
            className="flex-1 md:w-40 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-24 bg-slate-100 relative">
               <div className="absolute -bottom-8 left-6">
                 <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full border-4 border-white object-cover bg-white" />
               </div>
               <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${student.currentStatus === StudentStatus.IN ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {student.currentStatus}
                  </span>
               </div>
            </div>
            <div className="pt-10 p-6">
              <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{student.id}</p>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>Block {student.block}, Room {student.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span>{student.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  <span>{student.phone}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                View History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Students;