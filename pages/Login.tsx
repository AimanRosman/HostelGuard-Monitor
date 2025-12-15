import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserRole } from '../types';
import { ShieldCheck, User, ArrowRight, ArrowLeft, Info, ChevronDown } from 'lucide-react';
import { db } from '../services/mockDatabase';

interface LoginProps {
  onLogin: (role: UserRole, id: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Get a few sample students for Quick Login
  const demoStudents = db.students.getAll().slice(0, 5);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'warden') setActiveRole(UserRole.WARDEN);
    else if (roleParam === 'student') setActiveRole(UserRole.STUDENT);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeRole === UserRole.WARDEN) {
      // Warden Authentication
      if (password === 'admin') {
        onLogin(UserRole.WARDEN, 'WARDEN_01');
        navigate('/warden/dashboard');
      } else {
        alert('Invalid Credentials (Hint: Use password "admin")');
      }
    } else {
      // Student Access - No Password Required
      const studentId = id.trim() || 'S001';
      onLogin(UserRole.STUDENT, studentId);
      navigate('/student/dashboard');
    }
  };

  const handleQuickLogin = (studentId: string) => {
    setId(studentId);
    // Optional: auto-submit or just fill
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Monitor
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">HostelGuard</h1>
          <p className="text-slate-300">Secure Entry & Exit Monitoring</p>
        </div>
        
        {/* Role Toggles */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${activeRole === UserRole.STUDENT ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => { setActiveRole(UserRole.STUDENT); setId(''); setPassword(''); }}
          >
            <User size={18} /> Student Portal
          </button>
          <button
             className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${activeRole === UserRole.WARDEN ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => { setActiveRole(UserRole.WARDEN); setId(''); setPassword(''); }}
          >
            <ShieldCheck size={18} /> Warden Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {activeRole === UserRole.STUDENT ? 'Access Student Dashboard' : 'Warden Admin Panel'}
            </h2>
            <p className="text-sm text-slate-500">
              {activeRole === UserRole.STUDENT 
                ? 'Enter your Student ID to view your status, history, and requests.' 
                : 'Please log in to manage hostel security.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeRole === UserRole.STUDENT ? 'Student ID' : 'Warden ID'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder={activeRole === UserRole.STUDENT ? 'e.g. S001' : 'admin'}
                required
              />
              {activeRole === UserRole.STUDENT && (
                <div className="absolute right-2 top-2">
                   {/* Hidden trigger for dropdown via simple select if we wanted, but let's do buttons below */}
                </div>
              )}
            </div>
             
             {/* Quick Login Helper for Testing */}
             {activeRole === UserRole.STUDENT && (
               <div className="mt-3">
                 <p className="text-xs text-slate-400 mb-1">Quick Select (Demo):</p>
                 <div className="flex gap-2 flex-wrap">
                   {demoStudents.map(s => (
                     <button
                       key={s.id}
                       type="button"
                       onClick={() => handleQuickLogin(s.id)}
                       className={`text-xs px-2 py-1 rounded border transition-colors ${
                         id === s.id 
                           ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                           : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                       }`}
                     >
                       {s.id}
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>

          {activeRole === UserRole.WARDEN && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Hint: Use 'admin'</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {activeRole === UserRole.STUDENT ? 'Access Dashboard' : 'Login'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;