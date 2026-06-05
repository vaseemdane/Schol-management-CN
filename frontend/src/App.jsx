import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Layouts
import AdminLayout from "@/layouts/AdminLayout"
import TeacherLayout from "@/layouts/TeacherLayout"
import StudentLayout from "@/layouts/StudentLayout"

// Pages
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/auth/LoginPage"

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard"
import StudentsManagement from "@/pages/admin/StudentsManagement"
import TeachersManagement from "@/pages/admin/TeachersManagement"
import ClassesSubjects from "@/pages/admin/ClassesSubjects"
import FeeManagement from "@/pages/admin/FeeManagement"
import SalaryManagement from "@/pages/admin/SalaryManagement"
import Analytics from "@/pages/admin/Analytics"
import CertificateGenerator from "@/pages/admin/CertificateGenerator"
import Notifications from "@/pages/admin/Notifications"
import Promotion from "@/pages/admin/Promotion"
import Settings from "@/pages/admin/Settings"

// Teacher Pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard"
import TeacherAttendance from "@/pages/teacher/TeacherAttendance"
import TeacherResults from "@/pages/teacher/TeacherResults"
import TeacherAnalytics from "@/pages/teacher/TeacherAnalytics"

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard"
import StudentAttendance from "@/pages/student/StudentAttendance"
import StudentPerformance from "@/pages/student/StudentPerformance"
import StudentReports from "@/pages/student/StudentReports"
import StudentNotifications from "@/pages/student/StudentNotifications"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />

          {/* Admin Panel */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="teachers" element={<TeachersManagement />} />
            <Route path="classes" element={<ClassesSubjects />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="certificates" element={<CertificateGenerator />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="promotion" element={<Promotion />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Teacher Panel */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
          </Route>

          {/* Student Panel */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student", "parent"]}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
