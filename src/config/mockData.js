// ─────────────────────────────────────────────────────────────────────────────
// src/config/mockData.js
//
// UI-LEVEL CONSTANTS ONLY.
//
// Despite the historical filename, this module no longer contains any mock
// data, fake users, or seed records. Everything that lives here is static
// UI configuration (navigation, role tabs, colour palettes, label lists).
//
// Data access lives in:
//   • src/services/storage.js     — async localStorage wrappers
//   • src/services/dataService.js — domain CRUD (swap point for real API)
//   • src/services/authService.js — login / session helpers
// ─────────────────────────────────────────────────────────────────────────────

import {
  LayoutDashboard,
  SquareCheck as CheckSquare,
  Users,
  BookOpen,
  Printer,
  PenLine,
  CalendarCheck,
} from "lucide-react";

// ── Schema constants ─────────────────────────────────────────────────────────

export const SESSIONS = ["2024/2025", "2025/2026"];
export const TERMS = ["First Term", "Second Term", "Third Term"];
export const CLASS_CATEGORIES = ["nursery", "primary", "jss", "sss"];

/** Term options used in dropdowns across Teacher pages */
export const TERM_OPTIONS = [
  { session: "2025/2026", term: "First Term" },
  { session: "2025/2026", term: "Second Term" },
  { session: "2025/2026", term: "Third Term" },
];

/** Term keys for the Attendance page selector */
export const ATTENDANCE_TERM_KEYS = [
  "2025/2026|First Term",
  "2025/2026|Second Term",
  "2025/2026|Third Term",
  "2024/2025|Third Term",
];

/** Login-page role tabs */
export const ROLE_TABS = [
  { role: "admin", label: "Admin", color: "blue" },
  { role: "teacher", label: "Teacher", color: "green" },
  { role: "student", label: "Student", color: "orange" },
  { role: "parent", label: "Parent", color: "rose" },
];

/** Signup-page role options (excludes admin self-registration) */
export const SIGNUP_ROLES = [
  { value: "admin", label: "Admin"},
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent" },
  { value: "student", label: "Student" },
];

// ── Attendance page constants ────────────────────────────────────────────────

export const TOTAL_SCHOOL_DAYS = 120;
export const TERM_START_DATE = "2025-09-08";
export const ATTENDANCE_DAYS_PER_PAGE = 30;

export const ATTENDANCE_STATUS_CYCLE = {
  present: "absent",
  absent: "late",
  late: "holiday",
  holiday: "present",
};

export const ATTENDANCE_STATUS_COLOR = {
  present: { light: "bg-green-500 text-white", dark: "bg-green-600 text-white" },
  absent: { light: "bg-red-500 text-white", dark: "bg-red-600 text-white" },
  late: { light: "bg-yellow-400 text-white", dark: "bg-yellow-500 text-white" },
  holiday: { light: "bg-purple-300 text-white", dark: "bg-purple-700 text-white" },
};

export const ATTENDANCE_STATUS_LABEL = {
  present: "P",
  absent: "A",
  late: "L",
  holiday: "H",
};

// ── Navigation ───────────────────────────────────────────────────────────────

export const ADMIN_NAV = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/approve", label: "Approve Reports", icon: CheckSquare },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/classes", label: "Classes & Subjects", icon: BookOpen },
  { to: "/admin/print", label: "Print Report Card", icon: Printer },
];

export const TEACHER_NAV = [
  { to: "/teacher/my-class", label: "My Class", icon: Users },
  { to: "/teacher/grades", label: "Enter Grades", icon: PenLine },
  { to: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/teacher/print", label: "Print Reports", icon: Printer },
];

export const STUDENT_NAV = [
  { to: "/student/dashboard", label: "My Dashboard", icon: LayoutDashboard },
];

export const PARENT_NAV = [
  { to: "/parent/dashboard", label: "My Children", icon: Users },
];

/** Tab labels for the AdminApprove page */
export const APPROVE_TABS = [
  { key: "terms", label: "Term Reports" },
  { key: "teachers", label: "Teachers" },
  { key: "parents", label: "Parents" },
];

// ── Chart & colour palettes ──────────────────────────────────────────────────

export const PIE_COLORS = ["#22c55e", "#ef4444", "#eab308", "#C084FC"];
export const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export const CATEGORY_COLORS = {
  nursery: { light: "bg-purple-50 text-purple-700", dark: "bg-purple-900/30 text-purple-300" },
  primary: { light: "bg-blue-50 text-blue-700", dark: "bg-blue-900/30 text-blue-300" },
  jss: { light: "bg-green-50 text-green-700", dark: "bg-green-900/30 text-green-300" },
  sss: { light: "bg-orange-50 text-orange-700", dark: "bg-orange-900/30 text-orange-300" },
};

export const STATUS_STYLE = {
  approved: { light: "bg-green-100 text-green-700", dark: "bg-green-900/40 text-green-400" },
  pending: { light: "bg-yellow-100 text-yellow-700", dark: "bg-yellow-900/40 text-yellow-400" },
  draft: { light: "bg-slate-100 text-slate-600", dark: "bg-slate-700 text-slate-300" },
  rejected: { light: "bg-red-100 text-red-700", dark: "bg-red-900/40 text-red-400" },
};

export const ROLE_TAB_COLOR = {
  admin: "border-blue-600 text-blue-600",
  teacher: "border-green-600 text-green-600",
  student: "border-orange-500 text-orange-500",
  parent: "border-rose-500 text-rose-500",
};

export const ROLE_BTN_COLOR = {
  admin: "bg-blue-600 hover:bg-blue-700",
  teacher: "bg-green-600 hover:bg-green-700",
  student: "bg-orange-500 hover:bg-orange-600",
  parent: "bg-rose-500 hover:bg-rose-600",
};

// ── ReportCard trait lists ───────────────────────────────────────────────────

export const AFFECTIVE_TRAITS = [
  "Attentiveness",
  "Honesty",
  "Neatness",
  "Politeness",
  "Punctuality/ Assembly",
  "Self Control/ Calmness",
  "Obedience",
  "Reliability",
  "Sense Of Responsibility",
  "Relationship With Others",
];