import { Outlet } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { TEACHER_NAV } from "../../config/mockData";

export default function TeacherDashboard() {
  return (
    <DashboardLayout title="Teacher Dashboard" navItems={TEACHER_NAV}>
      <Outlet />
    </DashboardLayout>
  );
}
