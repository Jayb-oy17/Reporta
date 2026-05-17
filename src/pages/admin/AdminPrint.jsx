import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import ReportCard from '../../components/ReportCard';

export default function AdminPrint() {
  const { data } = useData();
  const { dark } = useTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  if (!data) return null;

  const classStudents = selectedClass ? data.students.filter(s => s.classId === selectedClass) : [];
  const student = data.students.find(s => s.id === selectedStudent);
  const terms = student ? student.terms : [];

  return (
    <div className="space-y-5">
      <h2 className={`text-xl font-bold ${dark?'text-white':'text-slate-800'}`}>Print Report Card (Proprietor)</h2>
      <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>
        Admins can print any student's report regardless of approval status. Unapproved reports will show a "PROPRIETOR COPY" watermark.
      </p>

      <div className={`rounded-xl border p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 ${dark?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-slate-300':'text-slate-600'}`}>Select Class</label>
          <select
            value={selectedClass}
            onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); setSelectedTerm(''); }}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'} outline-none`}
          >
            <option value="">– Select Class –</option>
            {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-slate-300':'text-slate-600'}`}>Select Student</label>
          <select
            value={selectedStudent}
            onChange={e => { setSelectedStudent(e.target.value); setSelectedTerm(''); }}
            disabled={!selectedClass}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'} outline-none disabled:opacity-50`}
          >
            <option value="">– Select Student –</option>
            {classStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${dark?'text-slate-300':'text-slate-600'}`}>Select Term</label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            disabled={!selectedStudent}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'} outline-none disabled:opacity-50`}
          >
            <option value="">– Select Term –</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>{t.session} – {t.term} ({t.status})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTerm && student && (
        <div className="mt-4 overflow-x-auto">
          <ReportCard
            studentId={selectedStudent}
            termId={selectedTerm}
            isProprietorCopy={true}
            editable={true}
            canEditPrincipalRemark={true}
            onPrint={() => window.print()}
          />
        </div>
      )}
    </div>
  );
}
