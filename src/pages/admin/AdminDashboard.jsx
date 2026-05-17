import { Outlet } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { ADMIN_NAV } from "../../config/mockData";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" navItems={ADMIN_NAV}>
      <Outlet />
    </DashboardLayout>
  );
}
