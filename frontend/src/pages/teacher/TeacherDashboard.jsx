import { useQuery } from "@tanstack/react-query"
import { teachersApi, studentsApi, classesApi, attendanceApi, marksApi } from "@/api"
import { useAuthStore } from "@/store/authStore"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage } from "@/components/ui/loading"
import { BookOpen, Users, ClipboardList, CheckSquare } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function TeacherDashboard() {
  const { user } = useAuthStore()

  const { data: profile } = useQuery({ queryKey: ["teacher-me"], queryFn: () => teachersApi.getMe().then(r => r.data) })
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })
  const { data: allMarks = [] } = useQuery({ queryKey: ["marks-all"], queryFn: () => marksApi.list({}).then(r => r.data) })

  const assignedClasses = Array.isArray(profile?.assigned_classes) ? profile.assigned_classes : (profile?.assigned_classes ? JSON.parse(profile.assigned_classes) : [])
  const assignedStudents = students.filter(s => assignedClasses.includes(s.class_id))

  const classStats = classes
    .filter(c => assignedClasses.includes(c.id))
    .map(c => ({
      name: `${c.name} ${c.section}`,
      students: students.filter(s => s.class_id === c.id).length,
    }))

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            Welcome, {profile?.name || "Teacher"}! 👋
          </h1>
          <p className="section-subtitle">
            {profile?.qualification} · Medium: <span className="text-foreground font-semibold">{profile?.medium === "Kannada" ? "Kannada Medium" : "English Medium"}</span> | C.N.Mugalkod Schools
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="My Classes" value={assignedClasses.length} icon={BookOpen} color="purple" />
        <StatCard title="My Students" value={assignedStudents.length} icon={Users} color="blue" />
        <StatCard title="Marks Entered" value={allMarks.length} icon={ClipboardList} color="green" />
        <StatCard title="Today's Date" value={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} icon={CheckSquare} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Students per Class</CardTitle></CardHeader>
          <CardContent>
            {classStats.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No classes assigned yet. Ask admin to assign you classes.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={classStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                  <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Mark Today's Attendance", href: "/teacher/attendance", color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20" },
              { label: "Add Exam Results", href: "/teacher/results", color: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20" },
              { label: "View Student Analytics", href: "/teacher/analytics", color: "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" },
            ].map(a => (
              <a key={a.href} href={a.href} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${a.color}`}>
                <span className="text-sm font-medium">{a.label}</span>
                <span className="text-lg">→</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
