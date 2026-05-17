import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import DashboardLayout from "../../components/DashboardLayout";
import ReportCard from "../../components/ReportCard";
import { Printer } from "lucide-react";
import { STUDENT_NAV, PIE_COLORS } from "../../config/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function StudentDashboard() {
  const { data } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();
  const [selTermId, setSelTermId] = useState("");

  if (!data) return null;

  const student = data.students.find((s) => s.id === session.userId);
  if (!student) return null;

  const cls = data.classes.find((c) => c.id === student.classId);
  const approvedTerms = student.terms.filter((t) => t.status === "approved");
  const latestApproved = approvedTerms.at(-1);
  const viewTerm =
    student.terms.find((t) => t.id === selTermId) || latestApproved;

  const scoreData =
    viewTerm?.subjects.map((s) => ({
      name: s.name.split(" ")[0],
      CA1: s.ca1,
      CA2: s.ca2,
      Exam: s.exam,
    })) || [];

  const att = viewTerm?.attendance || [];
  const pieData = [
    {
      name: "Present",
      value: att.filter((d) => d.status === "present").length,
    },
    { name: "Absent", value: att.filter((d) => d.status === "absent").length },
    { name: "Late", value: att.filter((d) => d.status === "late").length },
  ];

  return (
    <DashboardLayout title="Student Dashboard" navItems={STUDENT_NAV}>
      <div className="space-y-5">
        {/* Welcome card */}
        <div
          className={`rounded-xl border p-5 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
              {student.photo}
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
              >
                {student.name}
              </h2>
              <p
                className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                {cls?.name} • {student.admissionNumber}
              </p>
              <p
                className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
              >
                DOB: {student.dateOfBirth} •{" "}
                {student.gender === "M" ? "Male" : "Female"}
              </p>
            </div>
          </div>
        </div>

        {/* Term selector */}
        <div className={`flex items-center gap-3 ${dark ? "" : ""}`}>
          <label
            className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            View Term:
          </label>
          <select
            value={selTermId}
            onChange={(e) => setSelTermId(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"} outline-none`}
          >
            <option value="">Latest Approved</option>
            {student.terms.map((t) => (
              <option
                key={t.id}
                value={t.id}
                disabled={t.status !== "approved"}
              >
                {t.session} – {t.term} ({t.status})
              </option>
            ))}
          </select>
        </div>

        {!viewTerm && (
          <div
            className={`text-center py-10 rounded-xl border ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-400"}`}
          >
            <p className="text-lg font-medium">No approved reports yet.</p>
            <p className="text-sm mt-1">
              Your report is pending approval by the principal.
            </p>
          </div>
        )}

        {viewTerm && viewTerm.status !== "approved" && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark ? "bg-yellow-900/30 border-yellow-700 text-yellow-300" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}
          >
            <span className="text-sm font-medium">
              Report for {viewTerm.term} is pending approval. Check back later.
            </span>
          </div>
        )}

        {viewTerm && viewTerm.status === "approved" && (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                className={`rounded-xl border p-5 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <h3
                  className={`text-sm font-bold mb-3 ${dark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Subject Scores
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={scoreData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={dark ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#94a3b8" : "#64748b",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#94a3b8" : "#64748b",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: dark ? "#1e293b" : "#fff",
                        borderColor: dark ? "#334155" : "#e2e8f0",
                        color: dark ? "#f1f5f9" : "#1e293b",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="CA1" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="CA2" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Exam" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className={`rounded-xl border p-5 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <h3
                  className={`text-sm font-bold mb-3 ${dark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Attendance
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: dark ? "#1e293b" : "#fff",
                        borderColor: dark ? "#334155" : "#e2e8f0",
                        color: dark ? "#f1f5f9" : "#1e293b",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Full report */}
            <div className="mt-4">
              <div className="flex justify-center mb-3 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Printer size={16} /> Print Report Card
                </button>
              </div>
              <div className="overflow-x-auto">
                <ReportCard studentId={student.id} termId={viewTerm.id} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
