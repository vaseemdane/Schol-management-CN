import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuthStore()

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      admin: "/admin/dashboard",
      teacher: "/teacher/dashboard",
      student: "/student/dashboard",
      parent: "/student/dashboard",
    }
    return <Navigate to={redirectMap[role] || "/"} replace />
  }

  return children
}
