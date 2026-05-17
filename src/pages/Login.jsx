import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  ROLE_TABS,
  ROLE_TAB_COLOR,
  ROLE_BTN_COLOR,
} from "../config/mockData";
import { login as authLogin } from "../services/authService";

export default function Login() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await authLogin({ role: activeRole, username, password });
      if (!result.success) {
        setError(result.message);
        return;
      }
      const user = result.user;
      await login(activeRole, user.id, user.username || user.admissionNumber);
      const redirectMap = {
        admin: "/admin/overview",
        teacher: "/teacher/my-class",
        parent: "/parent/dashboard",
        student: "/student/dashboard",
      };
      navigate(redirectMap[activeRole]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
        dark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-blue-50"
      }`}
    >
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 p-2 rounded-full shadow-md ${
          dark ? "bg-slate-700 text-yellow-400" : "bg-white text-slate-600"
        }`}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden ${
          dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
            <img className="w-full h-full" src="src/assets/logo.png" alt="" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">EduReports NG</h1>
          <p className="text-blue-100 text-sm mt-1">
            School Report Management System
          </p>
          <p className="text-xs text-blue-200 mt-0.5">
            Ideal Nursery &amp; Primary School
          </p>
        </div>

        <div className="p-6">
          <div
            className={`flex rounded-lg overflow-hidden border mb-5 ${
              dark ? "border-slate-600" : "border-slate-200"
            }`}
          >
            {ROLE_TABS.map(({ role, label }) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeRole === role
                    ? ROLE_TAB_COLOR[role] +
                      " " +
                      (dark ? "bg-slate-700" : "bg-slate-50")
                    : `border-transparent ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {activeRole === "student" ? "Admission Number" : "Username"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  activeRole === "student"
                    ? "e.g. INPS/1001/2020"
                    : `Enter ${activeRole} username`
                }
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  dark
                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500"
                } outline-none focus:ring-2 focus:ring-blue-500/20`}
                required
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {activeRole === "student"
                  ? "Date of Birth (YYYY-MM-DD)"
                  : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    activeRole === "student"
                      ? "e.g. 2012-03-15"
                      : "Enter password"
                  }
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm transition-colors ${
                    dark
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500"
                  } outline-none focus:ring-2 focus:ring-blue-500/20`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-60 ${ROLE_BTN_COLOR[activeRole]}`}
            >
              {submitting
                ? "Signing in…"
                : `Sign In as ${ROLE_TABS.find((t) => t.role === activeRole)?.label}`}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className={dark ? "text-slate-400" : "text-slate-500"}>
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className={`font-semibold ${
                dark
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
