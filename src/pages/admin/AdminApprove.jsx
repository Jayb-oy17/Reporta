import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Eye,
} from "lucide-react";
import ReportCard from "../../components/ReportCard";
import { APPROVE_TABS } from "../../config/mockData";

export default function AdminApprove() {
  const {
    data,
    updateStudentTerm,
    updateStaff,
    updateParent,
    deleteStaff,
    deleteParent,
  } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();

  // ── Student term approval state ───────────────────────────────────
  const [filterClass, setFilterClass] = useState("");
  const [preview, setPreview] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  // ── Tab state ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("terms");

  if (!data) return null;

  // ── Gather data ────────────────────────────────────────────────────
  const pending = [];
  data.students.forEach((s) => {
    s.terms.forEach((t) => {
      if (t.status === "pending") {
        const cls = data.classes.find((c) => c.id === s.classId);
        pending.push({ student: s, term: t, cls });
      }
    });
  });

  const filtered = filterClass
    ? pending.filter((p) => p.student.classId === filterClass)
    : pending;

  const pendingTeachers = data.staff.filter(
    (s) => s.role === "teacher" && !s.approved,
  );
  const pendingParents = data.parents.filter((p) => !p.approved);

  // ── Tab counts ─────────────────────────────────────────────────────
  const tabCounts = {
    terms: filtered.length,
    teachers: pendingTeachers.length,
    parents: pendingParents.length,
  };

  // ── Actions ────────────────────────────────────────────────────────
  const approve = (studentId, termId) => {
    updateStudentTerm(studentId, termId, (t) => ({
      ...t,
      approved: true,
      status: "approved",
      approvedBy: session.userId,
      approvedAt: new Date().toISOString().slice(0, 10),
    }));
    setPreview(null);
  };

  const rejectTerm = (studentId, termId, note) => {
    updateStudentTerm(studentId, termId, (t) => ({
      ...t,
      approved: false,
      status: "rejected",
      rejectionNote: note,
      rejectedBy: session.userId,
    }));
    setRejectTarget(null);
    setRejectNote("");
    setPreview(null);
  };

  const approveTeacher = (staffId) => {
    updateStaff(staffId, (s) => ({ ...s, approved: true }));
  };

  const rejectTeacher = (staffId) => {
    deleteStaff(staffId);
  };

  const approveParent = (parentId) => {
    updateParent(parentId, (p) => ({ ...p, approved: true }));
  };

  const rejectParent = (parentId) => {
    deleteParent(parentId);
  };

  // ── Shared styles ──────────────────────────────────────────────────
  const sectionClass = `rounded-xl border shadow-sm overflow-hidden ${
    dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
  }`;

  const rowClass = (i) =>
    `border-b last:border-0 ${
      dark ? "border-slate-700" : "border-slate-100"
    } ${i % 2 === 0 ? (dark ? "bg-slate-800/50" : "bg-white") : dark ? "bg-slate-700/30" : "bg-slate-50/30"}`;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div
        className={`sticky top-0 z-40 flex gap-2 py-3 backdrop-blur-sm ${
          dark ? "bg-slate-900/80" : "bg-white/80"
        }`}
      >
        {APPROVE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? dark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-600 text-white"
                : dark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Term Reports Section ──────────────────────────────────── */}
      {activeTab === "terms" && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2
              className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
            >
              Term Reports
              {filtered.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              )}
            </h2>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                dark
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-slate-300 text-slate-800"
              } outline-none`}
            >
              <option value="">All Classes</option>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div
              className={`text-center py-8 rounded-xl border ${
                dark
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              No pending term reports{filterClass ? " for this class" : ""}.
            </div>
          ) : (
            <div className={sectionClass}>
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={
                      dark
                        ? "bg-slate-700 text-slate-200"
                        : "bg-slate-50 text-slate-600"
                    }
                  >
                    <th className="px-4 py-3 text-left font-semibold">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Class</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Session / Term
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Avg Score
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ student, term, cls }, i) => {
                    const avg =
                      term.subjects.length > 0
                        ? (
                            term.subjects.reduce((s, x) => s + x.total, 0) /
                            term.subjects.length
                          ).toFixed(1)
                        : "–";
                    return (
                      <tr
                        key={`${student.id}-${term.id}`}
                        className={rowClass(i)}
                      >
                        <td className="px-4 py-3 font-medium">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {cls?.name}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {term.session} – {term.term}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {avg}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                setPreview({
                                  studentId: student.id,
                                  termId: term.id,
                                })
                              }
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              title="Preview"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => approve(student.id, term.id)}
                              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() =>
                                setRejectTarget({
                                  studentId: student.id,
                                  termId: term.id,
                                })
                              }
                              className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Teachers Section ──────────────────────────────────────── */}
      {activeTab === "teachers" && (
        <div>
          <h2
            className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}
          >
            Teachers
            {pendingTeachers.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingTeachers.length}
              </span>
            )}
          </h2>
          {pendingTeachers.length === 0 ? (
            <div
              className={`text-center py-8 rounded-xl border ${
                dark
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              No pending teacher approvals.
            </div>
          ) : (
            <div className={sectionClass}>
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={
                      dark
                        ? "bg-slate-700 text-slate-200"
                        : "bg-slate-50 text-slate-600"
                    }
                  >
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Username
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTeachers.map((t, i) => (
                    <tr key={t.id} className={rowClass(i)}>
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-slate-500">{t.username}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approveTeacher(t.id)}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => rejectTeacher(t.id)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Parents Section ────────────────────────────────────────── */}
      {activeTab === "parents" && (
        <div>
          <h2
            className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}
          >
            Parents
            {pendingParents.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingParents.length}
              </span>
            )}
          </h2>
          {pendingParents.length === 0 ? (
            <div
              className={`text-center py-8 rounded-xl border ${
                dark
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              No pending parent approvals.
            </div>
          ) : (
            <div className={sectionClass}>
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={
                      dark
                        ? "bg-slate-700 text-slate-200"
                        : "bg-slate-50 text-slate-600"
                    }
                  >
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Username
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingParents.map((p, i) => (
                    <tr key={p.id} className={rowClass(i)}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.username}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approveParent(p.id)}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => rejectParent(p.id)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Preview Modal (unchanged) ──────────────────────────────── */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Report Card Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => approve(preview.studentId, preview.termId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => {
                    setRejectTarget(preview);
                    setPreview(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <ReportCard
                studentId={preview.studentId}
                termId={preview.termId}
                editable={true}
                canEditPrincipalRemark={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal (unchanged) ────────────────────────────────── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-sm p-6 ${
              dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
            }`}
          >
            <h3 className="font-bold text-lg mb-3">Reject Report</h3>
            <p className="text-sm text-slate-500 mb-3">
              Provide a reason for rejection (optional):
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                dark
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-slate-300"
              } outline-none`}
              placeholder="Enter rejection note..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  rejectTerm(
                    rejectTarget.studentId,
                    rejectTarget.termId,
                    rejectNote,
                  )
                }
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectNote("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  dark
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
