import { useMemo } from "react";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Users, BookOpen, Building2, TrendingUp, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PIE_COLORS } from "../../config/mockData";

function StatCard({ icon: Icon, label, value, sub, color }) {
  const { dark } = useTheme();
  return (
    <div
      className={`rounded-xl p-5 shadow-sm border ${
        dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {label}
          </p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
          {sub && (
            <p
              className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-400"}`}
            >
              {sub}
            </p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-lg ${color.replace("text-", "bg-").replace("600", "100").replace("500", "100")}`}
        >
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { data } = useData();
  const { dark } = useTheme();

  const stats = useMemo(() => {
    if (!data) return null;
    const totalStudents = data.students.length;
    const totalTeachers = data.staff.filter((s) => s.role === "teacher").length;
    const totalClasses = data.classes.length;

    // Avg attendance
    let totalAtt = 0,
      totalDays = 0;
    data.students.forEach((s) => {
      s.terms.forEach((t) => {
        if (t.attendance) {
          totalDays += t.attendance.length;
          totalAtt += t.attendance.filter((d) => d.status === "present").length;
        }
      });
    });
    const avgAtt =
      totalDays > 0 ? ((totalAtt / totalDays) * 100).toFixed(1) : "0.0";

    // Pass rate (total >= 50)
    let passed = 0,
      totalSubjs = 0;
    data.students.forEach((s) => {
      s.terms.forEach((t) => {
        t.subjects.forEach((subj) => {
          totalSubjs++;
          if (subj.total >= 50) passed++;
        });
      });
    });
    const passRate =
      totalSubjs > 0 ? ((passed / totalSubjs) * 100).toFixed(1) : "0";

    // Pending approvals
    let pending = 0;
    data.students.forEach((s) => {
      s.terms.forEach((t) => {
        if (t.status === "pending") pending++;
      });
    });

    // Bar chart data: avg score per class (first 6 classes for legibility)
    const barData = data.classes.slice(0, 8).map((cls) => {
      const classStudents = data.students.filter((s) => s.classId === cls.id);
      const subjectTotals = {
        Mathematics: [],
        "English Language": [],
        "Basic Science": [],
      };
      classStudents.forEach((s) => {
        const latestTerm = s.terms.find(
          (t) => t.session === "2025/2026" && t.term === "First Term",
        );
        if (latestTerm) {
          latestTerm.subjects.forEach((subj) => {
            if (subjectTotals[subj.name] !== undefined) {
              subjectTotals[subj.name].push(subj.total);
            }
          });
        }
      });
      const avg = (arr) =>
        arr.length > 0
          ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
          : 0;
      return {
        class: cls.name.replace("Nursery ", "Nur ").replace("Primary ", "Pri "),
        Math: avg(subjectTotals["Mathematics"]),
        English: avg(subjectTotals["English Language"]),
        Science: avg(subjectTotals["Basic Science"]),
      };
    });

    // Pie chart: whole-school attendance
    let present = 0,
      absent = 0,
      late = 0,
      holiday = 0;
    data.students.forEach((s) => {
      s.terms.forEach((t) => {
        t.attendance.forEach((d) => {
          if (d.status === "present") present++;
          else if (d.status === "absent") absent++;
          else if (d.staus === "late") late++;
          else holiday++;
        });
      });
    });
    const pieData = [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
      { name: "Late", value: late },
      { name: "Holiaday", value: holiday },
    ];

    // Recent pending
    const pendingList = [];
    data.students.forEach((s) => {
      s.terms.forEach((t) => {
        if (t.status === "pending") {
          const cls2 = data.classes.find((c) => c.id === s.classId);
          pendingList.push({
            studentName: s.name,
            className: cls2?.name,
            session: t.session,
            term: t.term,
            termId: t.id,
            studentId: s.id,
          });
        }
      });
    });

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      avgAtt,
      passRate,
      pending,
      barData,
      pieData,
      pendingList,
    };
  }, [data]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2
        className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
      >
        School Overview
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="text-blue-600"
        />
        <StatCard
          icon={BookOpen}
          label="Total Teachers"
          value={stats.totalTeachers}
          color="text-green-600"
        />
        <StatCard
          icon={Building2}
          label="Total Classes"
          value={stats.totalClasses}
          color="text-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Attendance"
          value={`${stats.avgAtt}%`}
          color="text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Pass Rate"
          value={`${stats.passRate}%`}
          sub="Subjects ≥ 50"
          color="text-sky-600"
        />
      </div>

      {/* Pending approvals alert */}
      {stats.pending > 0 && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            dark
              ? "bg-yellow-900/30 border-yellow-700 text-yellow-300"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
          <Clock size={18} />
          <span className="text-sm font-medium">
            {stats.pending} report(s) pending approval
          </span>
          <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">
            {stats.pending}
          </span>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div
          className={`rounded-xl p-5 shadow-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <h3
            className={`text-sm font-bold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}
          >
            Average Score by Class (First Term 2025/2026)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={stats.barData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={dark ? "#334155" : "#e2e8f0"}
              />
              <XAxis
                dataKey="class"
                tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#64748b" }}
              />
              <YAxis
                domain={[0, 100]}
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Math" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="English" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Science" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div
          className={`rounded-xl p-5 shadow-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <h3
            className={`text-sm font-bold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}
          >
            Whole-School Attendance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {stats.pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => v.toLocaleString()}
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

      {/* Recent pending */}
      {stats.pendingList.length > 0 && (
        <div
          className={`rounded-xl shadow-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <div
            className={`px-5 py-3 border-b ${dark ? "border-slate-700" : "border-slate-200"}`}
          >
            <h3
              className={`text-sm font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
              Pending Approvals
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {stats.pendingList.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p
                    className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-800"}`}
                  >
                    {item.studentName}
                  </p>
                  <p
                    className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {item.className} – {item.term} {item.session}
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
