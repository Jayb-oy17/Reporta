import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useTheme } from "../contexts/ThemeContext";
import { SIGNUP_ROLES } from "../config/mockData";

// ROLES moved to src/config/mockData.js as SIGNUP_ROLES

export default function Signup() {
  const { addStaff, addParent, addStudent, data } = useData();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState("teacher");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Student‑specific fields
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("M");
  const [className, setClassName] = useState(""); // optional – choose existing class or leave blank

  const isStudent = role === "student";
  const isParent = role === "parent";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (isStudent) {
      if (!dob) {
        setError("Date of birth is required.");
        return;
      }
      // Generate a unique admission number (simple incremental or timestamp)
      const admNum = `STU-${Date.now().toString().slice(-6)}`;
      const newStudent = {
        name: name.trim(),
        dateOfBirth: dob,
        gender,
        admissionNumber: admNum,
        classId: "", // not assigned yet – admin can update later
        age: "", // optional – could calculate from DOB
      };
      const res = await addStudent(newStudent);
      if (res && res.success) {
        setSuccess(
          `Account created! Your admission number is ${admNum}. Redirecting...`,
        );
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(res?.message || "Registration failed.");
      }
    } else {
      // Admin, Teacher, Parent
      if (!username.trim() || !password.trim()) {
        setError("Username and password are required.");
        return;
      }
      const staffOrParent = {
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
      };
      let res;
      if (isParent) {
        res = await addParent({ ...staffOrParent, students: [] });
      } else {
        res = await addStaff({
          ...staffOrParent,
          role, // 'admin' or 'teacher'
          title: role === "admin" ? "Admin" : "Teacher",
          subjects: [],
          isClassTeacherOf: null,
        });
      }
      if (res && res.success) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res?.message || "Registration failed.");
      }
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
    dark
      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-green-500"
      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-green-500"
  } outline-none focus:ring-2 focus:ring-green-500/20`;

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
        <div className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
            <img className="w-full h-full" src="src/assets/logo.png" alt="" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">EduReports NG</h1>
          <p className="text-green-100 text-sm mt-1">Create Your Account</p>
          <p className="text-xs text-green-200 mt-0.5">
            School Report Management System
          </p>
        </div>

        <div className="p-6">
          {/* Role tabs */}
          <div
            className={`flex rounded-lg overflow-hidden border mb-5 ${
              dark ? "border-slate-600" : "border-slate-200"
            }`}
          >
            {SIGNUP_ROLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRole(value);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-all ${
                  role === value
                    ? value === "admin"
                      ? "border-blue-600 text-blue-600 " +
                        (dark ? "bg-slate-700" : "bg-slate-50")
                      : value === "teacher"
                        ? "border-green-600 text-green-600 " +
                          (dark ? "bg-slate-700" : "bg-slate-50")
                        : value === "parent"
                          ? "border-rose-500 text-rose-500 " +
                            (dark ? "bg-slate-700" : "bg-slate-50")
                          : "border-orange-500 text-orange-500 " +
                            (dark ? "bg-slate-700" : "bg-slate-50")
                    : `border-transparent ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name – required for all */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isStudent ? "e.g. John Doe" : "e.g. John Doe"}
                className={inputClass}
                required
              />
            </div>

            {/* Student specific fields */}
            {isStudent && (
              <>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  A unique admission number will be generated for you.
                </p>
              </>
            )}

            {/* Admin / Teacher / Parent fields */}
            {!isStudent && (
              <>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        dark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-all shadow-sm ${
                role === "admin"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : role === "teacher"
                    ? "bg-green-600 hover:bg-green-700"
                    : role === "parent"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Create Account as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className={dark ? "text-slate-400" : "text-slate-500"}>
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className={`font-semibold ${
                dark
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
