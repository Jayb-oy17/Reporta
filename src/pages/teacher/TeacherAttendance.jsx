import { useState, useMemo, useEffect } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  TOTAL_SCHOOL_DAYS,
  TERM_START_DATE,
  ATTENDANCE_TERM_KEYS,
  ATTENDANCE_DAYS_PER_PAGE,
  ATTENDANCE_STATUS_CYCLE,
  ATTENDANCE_STATUS_COLOR,
  ATTENDANCE_STATUS_LABEL,
} from "../../config/mockData";

function generateWeekdays(startDateStr, count) {
  const dates = [];
  let current = new Date(startDateStr);
  while (dates.length < count) {
    const day = current.getDay();
    if (day >= 1 && day <= 5) {
      dates.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function normalizeAttendance(existingAttendance, allDates) {
  const existingMap = new Map(
    existingAttendance.map((a) => [a.date, a.status]),
  );
  return allDates.map((date) => ({
    date,
    status: existingMap.get(date) || "absent",
  }));
}

export default function TeacherAttendance() {
  const { data, updateStudentTerm } = useData();
  const { session } = useAuth();
  const { dark } = useTheme();
  const [selStudent, setSelStudent] = useState("");
  const [selTermKey, setSelTermKey] = useState("2025/2026|First Term");
  const [currentPage, setCurrentPage] = useState(0);

  if (!data) return null;

  const teacher = data.staff.find((s) => s.id === session.userId);
  const myClass = teacher?.isClassTeacherOf
    ? data.classes.find((c) => c.id === teacher.isClassTeacherOf)
    : null;
  const students = myClass
    ? data.students.filter((s) => s.classId === myClass.id)
    : [];

  const [selSession, selTerm] = selTermKey.split("|");
  const student = data.students.find((s) => s.id === selStudent);
  const termRecord = student?.terms.find(
    (t) => t.session === selSession && t.term === selTerm,
  );

  // Generate all term dates (sourced from mockData constants)
  const allDates = useMemo(
    () => generateWeekdays(TERM_START_DATE, TOTAL_SCHOOL_DAYS),
    [],
  );

  const normalizedAttendance = useMemo(() => {
    if (!termRecord) return [];
    const existing = termRecord.attendance || [];
    return normalizeAttendance(existing, allDates);
  }, [termRecord, allDates]);

  const paginatedDays = useMemo(() => {
    const start = currentPage * ATTENDANCE_DAYS_PER_PAGE;
    return normalizedAttendance.slice(start, start + ATTENDANCE_DAYS_PER_PAGE);
  }, [normalizedAttendance, currentPage]);

  const totalPages = Math.ceil(
    normalizedAttendance.length / ATTENDANCE_DAYS_PER_PAGE,
  );

  const toggleDay = (dateStr) => {
    if (!student || !termRecord) return;
    const currentStatus =
      normalizedAttendance.find((d) => d.date === dateStr)?.status || "absent";
    const newStatus = ATTENDANCE_STATUS_CYCLE[currentStatus];

    updateStudentTerm(student.id, termRecord.id, (t) => {
      const existingAttendance = t.attendance || [];
      const existingMap = new Map(
        existingAttendance.map((a) => [a.date, a.status]),
      );
      existingMap.set(dateStr, newStatus);
      const newAttendance = Array.from(existingMap.entries()).map(
        ([date, status]) => ({ date, status }),
      );
      return { ...t, attendance: newAttendance };
    });
  };

  const stats = useMemo(() => {
    if (!termRecord || normalizedAttendance.length === 0) return null;
    let present = 0,
      absent = 0,
      late = 0,
      holidays = 0;
    for (const day of normalizedAttendance) {
      switch (day.status) {
        case "present":
          present++;
          break;
        case "absent":
          absent++;
          break;
        case "late":
          late++;
          break;
        case "holiday":
          holidays++;
          break;
        default:
          break;
      }
    }
    const totalSchoolDays = TOTAL_SCHOOL_DAYS - holidays;
    const pct =
      totalSchoolDays > 0
        ? ((present / totalSchoolDays) * 100).toFixed(1)
        : "0";
    return { present, absent, late, holidays, totalSchoolDays, pct };
  }, [normalizedAttendance, termRecord]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selStudent]);

  return (
    <div className="space-y-5">
      <h2
        className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
      >
        Attendance
      </h2>

      <div
        className={`rounded-xl border p-4 grid grid-cols-2 gap-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        <div>
          <label
            className={`block text-xs font-semibold mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            Term
          </label>
          <select
            value={selTermKey}
            onChange={(e) => setSelTermKey(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300"} outline-none`}
          >
            {ATTENDANCE_TERM_KEYS.map((k) => (
              <option key={k} value={k}>
                {k.replace("|", " – ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className={`block text-xs font-semibold mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}
          >
            Student
          </label>
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

      {stats && (
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: "School Days",
              value: stats.totalSchoolDays,
              color: "text-blue-500",
            },
            { label: "Present", value: stats.present, color: "text-green-500" },
            { label: "Absent", value: stats.absent, color: "text-red-500" },
            { label: "Late", value: stats.late, color: "text-yellow-500" },
            {
              label: "Attendance",
              value: `${stats.pct}%`,
              color: "text-emerald-500",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`rounded-xl border p-3 text-center ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p
                className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {normalizedAttendance.length > 0 && (
        <div
          className={`rounded-xl border p-5 shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3
              className={`text-sm font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
              Term Calendar (click to toggle: Present → Absent → Late → Holiday)
            </h3>
            <div className="flex gap-3 text-xs flex-wrap">
              {["Present", "Absent", "Late", "Holiday"].map((s) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className={`w-3 h-3 rounded inline-block ${
                      s === "Present"
                        ? "bg-green-500"
                        : s === "Absent"
                          ? "bg-red-500"
                          : s === "Late"
                            ? "bg-yellow-400"
                            : "bg-purple-400"
                    }`}
                  ></span>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`px-3 py-1 rounded text-sm ${dark ? "bg-slate-700 text-slate-300 disabled:opacity-50" : "bg-slate-200 text-slate-700 disabled:opacity-50"}`}
            >
              Previous
            </button>
            <span
              className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage === totalPages - 1}
              className={`px-3 py-1 rounded text-sm ${dark ? "bg-slate-700 text-slate-300 disabled:opacity-50" : "bg-slate-200 text-slate-700 disabled:opacity-50"}`}
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1.5 max-h-[400px] overflow-y-auto p-1">
            {paginatedDays.map((day) => (
              <button
                key={day.date}
                onClick={() => toggleDay(day.date)}
                title={`${day.date}: ${day.status}`}
                className={`rounded-lg p-2 text-center hover:opacity-80 transition-opacity ${ATTENDANCE_STATUS_COLOR[day.status]?.[dark ? "dark" : "light"]}`}
              >
                <div className="text-xs font-bold">{day.date.slice(8, 10)}</div>
                <div className="text-xs opacity-80 leading-tight">
                  {day.date.slice(5, 7)}
                </div>
                <div className="text-[10px] font-mono mt-0.5">
                  {ATTENDANCE_STATUS_LABEL[day.status]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selStudent && !termRecord && (
        <div
          className={`text-center py-8 text-sm rounded-xl border ${dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-400"}`}
        >
          No attendance data for this term. Start recording by clicking on any
          day.
        </div>
      )}
    </div>
  );
}
