import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { KeyRound, X, Check, Eye, EyeOff, UserPlus } from "lucide-react";

function gradeColor(avg, dark) {
  if (avg >= 80) return dark ? "text-green-400" : "text-green-600";
  if (avg >= 60) return dark ? "text-yellow-400" : "text-yellow-600";
  return dark ? "text-red-400" : "text-red-600";
}

export default function TeacherMyClass() {
  const { data, updateStudent } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();
  const [loginModal, setLoginModal] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  if (!data) return null;

  const teacher = data.staff.find((s) => s.id === session.userId);
  if (!teacher) return <p>Teacher not found.</p>;

  const myClass = data.classes.find((c) => c.classTeacherId === teacher.id);

  if (!myClass) {
    return (
      <div
        className={`rounded-xl border p-8 text-center ${
          dark
            ? "bg-slate-800 border-slate-700 text-slate-400"
            : "bg-white border-slate-200 text-slate-400"
        }`}
      >
        <p className="text-lg font-medium">
          You are not assigned as a class teacher.
        </p>
        <p className="text-sm mt-1">Contact admin to be assigned to a class.</p>
      </div>
    );
  }

  const students = data.students.filter((s) => s.classId === myClass.id);

  const openLoginModal = (student) => {
    setLoginModal(student);
    setNewPassword(student.dateOfBirth || "");
    setShowPass(false);
    setSavedMsg("");
  };

  const saveLogin = () => {
    if (!loginModal || !newPassword.trim()) return;
    updateStudent(loginModal.id, (s) => ({
      ...s,
      dateOfBirth: newPassword.trim(),
    }));
    setSavedMsg(`Login updated for ${loginModal.name}`);
    setTimeout(() => {
      setLoginModal(null);
      setSavedMsg("");
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2
            className={`text-xl font-bold ${
              dark ? "text-white" : "text-slate-800"
            }`}
          >
            My Class – {myClass.name}
          </h2>
          <p
            className={`text-sm mt-0.5 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {students.length} students enrolled
          </p>
        </div>
        <div
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
            dark
              ? "bg-slate-800 border-slate-700 text-slate-300"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <KeyRound size={14} />
          <span>Click the key icon to set a student's login password</span>
        </div>
      </div>

      <div
        className={`rounded-xl border overflow-hidden shadow-sm ${
          dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className={
                dark
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-50 text-slate-600"
              }
            >
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">
                Admission No.
              </th>
              <th className="px-4 py-3 text-left font-semibold">Gender</th>
              <th className="px-4 py-3 text-center font-semibold">Term Avg</th>
              <th className="px-4 py-3 text-center font-semibold">
                Attendance %
              </th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Login</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              dark ? "divide-slate-700" : "divide-slate-100"
            }`}
          >
            {students.map((s, i) => {
              const latestTerm = s.terms.find(
                (t) => t.session === "2025/2026" && t.term === "First Term",
              );
              const avg =
                latestTerm && latestTerm.subjects.length > 0
                  ? (
                      latestTerm.subjects.reduce((sum, x) => sum + x.total, 0) /
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
                    ).toFixed(0)
                  : "–";
              const status = latestTerm?.status || "draft";
              const statusStyle = {
                approved: dark
                  ? "bg-green-900/40 text-green-400"
                  : "bg-green-100 text-green-700",
                pending: dark
                  ? "bg-yellow-900/40 text-yellow-400"
                  : "bg-yellow-100 text-yellow-700",
                draft: dark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-600",
                rejected: dark
                  ? "bg-red-900/40 text-red-400"
                  : "bg-red-100 text-red-700",
              };
              return (
                <tr
                  key={s.id}
                  className={
                    i % 2 === 0
                      ? dark
                        ? "bg-slate-800"
                        : "bg-white"
                      : dark
                        ? "bg-slate-800/60"
                        : "bg-slate-50/50"
                  }
                >
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {s.admissionNumber}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {s.gender === "M" ? "Male" : "Female"}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-center font-bold ${gradeColor(
                      parseFloat(avg),
                      dark,
                    )}`}
                  >
                    {avg}%
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-500">
                    {attPct}%
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyle[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => openLoginModal(s)}
                      title="Set student login password"
                      className={`p-1.5 rounded-lg transition-colors ${
                        dark
                          ? "bg-slate-700 hover:bg-blue-900/40 text-blue-400"
                          : "bg-slate-100 hover:bg-blue-100 text-blue-600"
                      }`}
                    >
                      <KeyRound size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Login setup modal */}
      {loginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${
              dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserPlus size={18} className="text-blue-500" />
                Student Login
              </h3>
              <button
                onClick={() => setLoginModal(null)}
                className={`p-1.5 rounded-lg ${
                  dark ? "hover:bg-slate-700" : "hover:bg-slate-100"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className={`rounded-lg p-3 mb-4 text-sm ${
                dark ? "bg-slate-700" : "bg-slate-50"
              }`}
            >
              <p className="font-semibold">{loginModal.name}</p>
              <p
                className={`text-xs mt-0.5 ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {loginModal.admissionNumber}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 mb-4 text-xs border ${
                dark
                  ? "bg-blue-900/20 border-blue-800 text-blue-300"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <p className="font-semibold mb-1">Student Login Instructions:</p>
              <p>
                Username:{" "}
                <strong className="font-mono">
                  {loginModal.admissionNumber}
                </strong>
              </p>
              <p>
                Password: <strong>(the date of birth set below)</strong>
              </p>
              <p className="mt-1 opacity-75">
                Student selects the "Student" tab on the login page.
              </p>
            </div>

            <div className="mb-4">
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Date of Birth / Password{" "}
                <span className="font-normal opacity-60">(YYYY-MM-DD)</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. 2012-03-15"
                  className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm ${
                    dark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300"
                  } outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p
                className={`text-xs mt-1 ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                This becomes the student's login password. Share it with the
                student or parent.
              </p>
            </div>

            {savedMsg && (
              <div className="mb-3 text-center text-sm text-green-500 font-medium">
                {savedMsg}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveLogin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Check size={15} /> Save Login
              </button>
              <button
                onClick={() => setLoginModal(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm ${
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
