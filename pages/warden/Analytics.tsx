import React, { useState } from 'react';
import { db } from '../../services/mockDatabase';
import { generateAiInsights } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, RefreshCw } from 'lucide-react';

const Analytics: React.FC = () => {
  const [logs] = useState(db.logs.getAll());
  const [insight, setInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Prepare chart data: Entries per hour (simplified)
  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    entries: 0,
    exits: 0
  }));

  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    if (log.type === 'ENTER') hourData[hour].entries++;
    else hourData[hour].exits++;
  });

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const result = await generateAiInsights(logs);
    setInsight(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Analytics & Reports</h2>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-300" />
            <h3 className="text-lg font-semibold">Gemini AI Insights</h3>
          </div>
          <button 
            onClick={handleGenerateInsight}
            disabled={loadingAi}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingAi ? <RefreshCw className="animate-spin" size={16} /> : 'Analyze Patterns'}
          </button>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4 min-h-[100px]">
          {insight ? (
            <div className="whitespace-pre-line text-sm leading-relaxed text-indigo-100">
              {insight}
            </div>
          ) : (
            <p className="text-indigo-200 italic">Click "Analyze Patterns" to let AI identify entry/exit trends, potential late entry hotspots, and unusual activities.</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-6">Traffic by Hour</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="entries" name="Entries" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exits" name="Exits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
