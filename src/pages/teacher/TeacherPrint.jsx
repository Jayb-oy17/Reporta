import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ReportCard from '../../components/ReportCard';

export default function TeacherPrint() {
  const { data } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();
  const [selStudent, setSelStudent] = useState('');
  const [selTerm, setSelTerm] = useState('');

  if (!data) return null;

  const teacher = data.staff.find(s => s.id === session.userId);
  const myClass = teacher?.isClassTeacherOf
    ? data.classes.find(c => c.id === teacher.isClassTeacherOf)
    : null;
  const students = myClass ? data.students.filter(s => s.classId === myClass.id) : [];
  const student = data.students.find(s => s.id === selStudent);

  return (
    <div className="space-y-5">
      <h2 className={`text-xl font-bold ${dark?'text-white':'text-slate-800'}`}>Print Reports</h2>

      <div className={`rounded-xl border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-slate-300':'text-slate-600'}`}>Student</label>
          <select
            value={selStudent}
            onChange={e => { setSelStudent(e.target.value); setSelTerm(''); }}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'} outline-none`}
          >
            <option value="">– Select Student –</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-slate-300':'text-slate-600'}`}>Term</label>
          <select
            value={selTerm}
            onChange={e => setSelTerm(e.target.value)}
            disabled={!selStudent}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'} outline-none disabled:opacity-50`}
          >
            <option value="">– Select Term –</option>
            {student?.terms.map(t => (
              <option key={t.id} value={t.id}>{t.session} – {t.term} ({t.status})</option>
            ))}
          </select>
        </div>
      </div>

      {selTerm && (
        <div className="mt-4 overflow-x-auto">
          <ReportCard
            studentId={selStudent}
            termId={selTerm}
            editable={true}
            onPrint={() => window.print()}
          />
        </div>
      )}
    </div>
  );
}
