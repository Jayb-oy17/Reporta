import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Preloader from "./components/Preloader";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminApprove from "./pages/admin/AdminApprove";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminPrint from "./pages/admin/AdminPrint";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherMyClass from "./pages/teacher/TeacherMyClass";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherPrint from "./pages/teacher/TeacherPrint";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import Signup from "./pages/signup";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: "overview", element: <AdminOverview /> },
      { path: "approve", element: <AdminApprove /> },
      { path: "users", element: <AdminManageUsers /> },
      { path: "classes", element: <AdminClasses /> },
      { path: "print", element: <AdminPrint /> },
    ],
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute role="teacher">
        <TeacherDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/teacher/my-class" replace /> },
      { path: "my-class", element: <TeacherMyClass /> },
      { path: "grades", element: <TeacherGrades /> },
      { path: "attendance", element: <TeacherAttendance /> },
      { path: "print", element: <TeacherPrint /> },
    ],
  },
  {
    path: "/student/dashboard",
    element: (
      <ProtectedRoute role="student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/student", element: <Navigate to="/student/dashboard" replace /> },
  {
    path: "/parent/dashboard",
    element: (
      <ProtectedRoute role="parent">
        <ParentDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/parent", element: <Navigate to="/parent/dashboard" replace /> },
]);

export default function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <Preloader
        onFinish={() => setLoading(false)}
        logo="/src/assets/logo.png"
      />
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
