import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockDatabase';
import { HostelEvent, Student, StudentStatus } from '../../types';
import { Calendar, Users, CheckSquare, Plus, Check, Search, RefreshCw } from 'lucide-react';

const Events: React.FC = () => {
  const [events, setEvents] = useState<HostelEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<HostelEvent | null>(null);
  const [students] = useState<Student[]>(db.students.getAll());
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  
  // Create Event Form
  const [isCreating, setIsCreating] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');

  // Search filter for roll call
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    setEvents(db.events.getAll());
  }, []);

  useEffect(() => {
    if (activeEvent) {
      setAttendees(new Set(activeEvent.attendees));
    }
  }, [activeEvent]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: HostelEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: newEventDate,
      startTime: newEventTime,
      attendees: []
    };
    db.events.add(newEvent);
    setEvents(db.events.getAll());
    setIsCreating(false);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
  };

  const toggleAttendance = (studentId: string) => {
    const newAttendees = new Set(attendees);
    if (newAttendees.has(studentId)) {
      newAttendees.delete(studentId);
    } else {
      newAttendees.add(studentId);
    }
    setAttendees(newAttendees);
  };

  const saveRollCall = () => {
    if (!activeEvent) return;
    db.events.updateAttendees(activeEvent.id, Array.from(attendees));
    setEvents(db.events.getAll());
    setActiveEvent(null);
    alert('Roll call saved successfully!');
  };

  const autoMarkPresent = () => {
    // Mark everyone who is currently "IN" as present
    const newAttendees = new Set(attendees);
    students.forEach(s => {
      if (s.currentStatus === StudentStatus.IN) {
        newAttendees.add(s.id);
      }
    });
    setAttendees(newAttendees);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Events & Roll Call</h2>
          <p className="text-slate-500">Manage scheduled events and track student attendance.</p>
        </div>
        {!activeEvent && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus size={18} /> Create Event
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2">
           <h3 className="font-bold text-slate-800 mb-4">New Event Details</h3>
           <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-600 mb-1">Event Title</label>
               <input required type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Night Roll Call" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
               <input required type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
               <input required type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
             </div>
             <div className="flex gap-2">
               <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 border rounded-lg hover:bg-slate-50">Cancel</button>
               <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex-1">Save Event</button>
             </div>
           </form>
        </div>
      )}

      {!activeEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <Calendar size={24} />
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {event.attendees.length} Attended
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{event.title}</h3>
              <p className="text-slate-500 text-sm mb-4">
                {new Date(event.date).toLocaleDateString()} at {event.startTime}
              </p>
              <button 
                onClick={() => setActiveEvent(event)}
                className="w-full py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-2"
              >
                <CheckSquare size={16} /> Start Roll Call
              </button>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No events scheduled. Create one to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div>
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <CheckSquare size={20} className="text-emerald-500"/>
                 Roll Call: {activeEvent.title}
               </h3>
               <p className="text-xs text-slate-500">Mark students present manually or use auto-sync.</p>
             </div>
             <div className="flex gap-2">
               <button onClick={autoMarkPresent} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-2">
                 <RefreshCw size={14} /> Auto-Sync (Who is IN)
               </button>
               <button onClick={() => setActiveEvent(null)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
               <button onClick={saveRollCall} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">Save Attendance</button>
             </div>
           </div>

           <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {filteredStudents.map(student => {
                   const isPresent = attendees.has(student.id);
                   return (
                     <div 
                       key={student.id} 
                       onClick={() => toggleAttendance(student.id)}
                       className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                         isPresent 
                           ? 'bg-emerald-50 border-emerald-200' 
                           : 'bg-white border-slate-200 hover:bg-slate-50'
                       }`}
                     >
                       <div className={`w-5 h-5 rounded flex items-center justify-center border ${isPresent ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                          {isPresent && <Check size={12} />}
                       </div>
                       <img src={student.photoUrl} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                       <div>
                         <p className={`text-sm font-bold ${isPresent ? 'text-emerald-900' : 'text-slate-700'}`}>{student.name}</p>
                         <p className="text-xs text-slate-500">{student.id} • Room {student.room}</p>
                       </div>
                       <div className="ml-auto">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${student.currentStatus === StudentStatus.IN ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {student.currentStatus}
                          </span>
                       </div>
                     </div>
                   );
                 })}
              </div>
           </div>
           
           <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600">
              <span>Total Students: {students.length}</span>
              <span className="font-bold text-slate-800">Present: {attendees.size}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default Events;