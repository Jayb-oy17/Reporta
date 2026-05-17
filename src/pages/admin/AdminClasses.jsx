import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminClasses() {
  const { data } = useData();
  const { dark } = useTheme();
  const [expanded, setExpanded] = useState(null);

  if (!data) return null;

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const categoryColors = {
    nursery: dark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700',
    primary: dark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700',
    jss: dark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700',
    sss: dark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="space-y-5">
      <h2 className={`text-xl font-bold ${dark?'text-white':'text-slate-800'}`}>Classes &amp; Subjects</h2>

      <div className="space-y-3">
        {data.classes.map(cls => {
          const classTeacher = data.staff.find(s => s.id === cls.classTeacherId);
          const students = data.students.filter(s => s.classId === cls.id);
          const isOpen = expanded === cls.id;

          // Get subjects from first student in this class
          const sample = students[0];
          const subjects = sample?.terms?.[0]?.subjects?.map(s => s.name) || [];

          return (
            <div key={cls.id} className={`rounded-xl border shadow-sm overflow-hidden ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
              <button
                onClick={() => toggle(cls.id)}
                className={`w-full flex items-center justify-between px-5 py-4 text-left hover:${dark?'bg-slate-700':'bg-slate-50'} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                  <span className={`font-bold text-base ${dark?'text-white':'text-slate-800'}`}>{cls.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[cls.category]||''}`}>
                    {cls.category?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{students.length} students</span>
                  <span className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>
                    Teacher: {classTeacher?.name || 'Unassigned'}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className={`border-t px-5 py-4 ${dark?'border-slate-700':'border-slate-100'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subjects */}
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wide mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {subjects.length > 0 ? subjects.map(s => (
                          <span key={s} className={`text-xs px-2.5 py-1 rounded-full ${dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-700'}`}>{s}</span>
                        )) : <span className="text-xs text-slate-400">No subjects assigned</span>}
                      </div>
                    </div>

                    {/* Students roster */}
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wide mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>Student Roster</h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {students.map((s, i) => {
                          const latestTerm = s.terms.find(t => t.session === '2025/2026' && t.term === 'First Term');
                          const avg = latestTerm && latestTerm.subjects.length > 0
                            ? (latestTerm.subjects.reduce((sum, x) => sum + x.total, 0) / latestTerm.subjects.length).toFixed(0)
                            : '–';
                          return (
                            <div key={s.id} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${
                              i%2===0?(dark?'bg-slate-700/50':'bg-slate-50'):(dark?'':'')
                            }`}>
                              <span className={dark?'text-slate-200':'text-slate-700'}>{i+1}. {s.name}</span>
                              <span className={`font-semibold ${dark?'text-blue-400':'text-blue-600'}`}>{avg}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
