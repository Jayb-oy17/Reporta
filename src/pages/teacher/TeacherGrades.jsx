import { TERM_OPTIONS, BAR_COLORS } from "../../config/mockData";
import { useState, useEffect } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { SendHorizontal } from "lucide-react"; // keep any icons you need
import ReportCard from "../../components/ReportCard"; // adjust import
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TeacherGrades() {
  const { data, updateStudentTerm } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();

  const [selSession, setSelSession] = useState("2025/2026");
  const [selTerm, setSelTerm] = useState("First Term");
  const [selStudent, setSelStudent] = useState("");

  if (!data) return null;

  const teacher = data.staff.find((s) => s.id === session.userId);
  const myClass = data.classes.find((c) => c.classTeacherId === session.userId);
  const myClassId = myClass?.id;
  const students = myClass
    ? data.students.filter((s) => s.classId === myClassId)
    : [];

  const student = data.students.find((s) => s.id === selStudent);
  const termRecord = student?.terms.find(
    (t) => t.session === selSession && t.term === selTerm,
  );

  // Handlers for submission
  const handleSubmitForApproval = async () => {
    if (!student || !termRecord) return;
    updateStudentTerm(student.id, termRecord.id, (t) => ({
      ...t,
      status: "pending",
      approved: false,
    }));
  };

  // Bar chart data (optional; you can keep it)
  const chartData = termRecord
    ? termRecord.subjects.map((s) => ({
        name: s.name.split(" ")[0],
        CA1: s.ca1,
        CA2: s.ca2,
        Exam: s.exam,
      }))
    : [];

  return (
    <div className="space-y-5">
      <h2
        className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
      >
        Enter Grades
      </h2>

      {/* Selectors – unchanged */}
      <div
        className={`rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        <div>
          <label>Term</label>
          <select
            value={`${selSession}|${selTerm}`}
            onChange={(e) => {
              const [s, t] = e.target.value.split("|");
              setSelSession(s);
              setSelTerm(t);
              setSelStudent("");
            }}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"} outline-none`}
          >
            {TERM_OPTIONS.map((o) => (
              <option
                key={`${o.session}|${o.term}`}
                value={`${o.session}|${o.term}`}
              >
                {o.session} – {o.term}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label>Student</label>
          <select
            value={selStudent}
            onChange={(e) => setSelStudent(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"} outline-none`}
          >
            <option value="">– Select Student –</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!myClass && (
        <div className="text-center py-8 text-sm text-slate-400">
          You are not assigned as a class teacher.
        </div>
      )}

      {/* Full report card with editable mode */}
      {student && termRecord && (
        <ReportCard
          studentId={selStudent}
          termId={termRecord.id}
          editable={true}
          onSubmitForApproval={handleSubmitForApproval}
          // onPrint={...}  // optional: you can add a print button here
        />
      )}

      {/* Optional bar chart */}
      {chartData.length > 0 && (
        <div
          className={`rounded-xl border p-5 shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <h3
            className={`text-sm font-bold mb-3 ${dark ? "text-slate-200" : "text-slate-700"}`}
          >
            Score Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={dark ? "#334155" : "#e2e8f0"}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }}
              />
              <YAxis
                domain={[0, 60]}
                tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  background: dark ? "#1e293b" : "#fff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f1f5f9" : "#1e293b",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="CA1" fill={BAR_COLORS[0]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="CA2" fill={BAR_COLORS[1]} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Exam" fill={BAR_COLORS[2]} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
