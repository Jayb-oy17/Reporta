import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import DashboardLayout from "../../components/DashboardLayout";
import ReportCard from "../../components/ReportCard";
import { Printer } from "lucide-react";
import { PARENT_NAV } from "../../config/mockData";

export default function ParentDashboard() {
  const { data } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();
  const [selected, setSelected] = useState(null); // { studentId, termId }

  if (!data) return null;

  const parent = data.parents.find((p) => p.id === session.userId);
  if (!parent) return null;

  const children = data.students.filter((s) =>
    parent.studentIds?.includes(s.id),
  );

  return (
    <DashboardLayout title="Parent Dashboard" navItems={PARENT_NAV}>
      <div className="space-y-5">
        <h2
          className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
        >
          Welcome, {parent.name}
        </h2>

        {children.length === 0 && (
          <div
            className={`text-center py-10 rounded-xl border ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-400"}`}
          >
            No children linked to your account. Contact admin.
          </div>
        )}

        {/* Children cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((student) => {
            const cls = data.classes.find((c) => c.id === student.classId);
            const approvedTerms = student.terms.filter(
              (t) => t.status === "approved",
            );
            const latestTerm = approvedTerms.at(-1);
            const avg =
              latestTerm?.subjects.length > 0
                ? (
                    latestTerm.subjects.reduce((s, x) => s + x.total, 0) /
                    latestTerm.subjects.length
                  ).toFixed(1)
                : "–";
            const att = latestTerm?.attendance || [];
            const attPct =
              att.length > 0
                ? (
                    (att.filter((d) => d.status === "present").length /
                      att.length) *
                    100
                  ).toFixed(1)
                : "–";

            return (
              <div
                key={student.id}
                className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow cursor-default ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl">
                    {student.photo}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-base ${dark ? "text-white" : "text-slate-800"}`}
                    >
                      {student.name}
                    </h3>
                    <p
                      className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {cls?.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div
                    className={`rounded-lg p-2.5 text-center ${dark ? "bg-slate-700" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-xl font-black ${dark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {avg}%
                    </p>
                    <p
                      className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Term Avg
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-2.5 text-center ${dark ? "bg-slate-700" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-xl font-black ${dark ? "text-green-400" : "text-green-600"}`}
                    >
                      {attPct}%
                    </p>
                    <p
                      className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Attendance
                    </p>
                  </div>
                </div>

                {/* Term selector */}
                <div className="mb-3">
                  <select
                    onChange={(e) =>
                      setSelected(
                        e.target.value
                          ? { studentId: student.id, termId: e.target.value }
                          : null,
                      )
                    }
                    defaultValue=""
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"} outline-none`}
                  >
                    <option value="">View a report...</option>
                    {approvedTerms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.session} – {t.term}
                      </option>
                    ))}
                  </select>
                </div>

                {latestTerm && (
                  <button
                    onClick={() =>
                      setSelected({
                        studentId: student.id,
                        termId: latestTerm.id,
                      })
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Latest Report
                  </button>
                )}
                {!latestTerm && (
                  <p
                    className={`text-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    No approved report yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Report modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-slate-800">Report Card</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-x-auto">
                <ReportCard
                  studentId={selected.studentId}
                  termId={selected.termId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
