import { useQuery } from "@tanstack/react-query"
import { studentsApi, attendanceApi, feesApi, marksApi } from "@/api"
import { useAuthStore } from "@/store/authStore"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage } from "@/components/ui/loading"
import { User, Calendar, CreditCard, TrendingUp, GraduationCap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: profile, isLoading: loadP } = useQuery({ queryKey: ["student-me"], queryFn: () => studentsApi.getMe().then(r => r.data) })
  const { data: attSummary } = useQuery({
    queryKey: ["student-att-summary", profile?.id],
    queryFn: () => attendanceApi.studentSummary(profile.id).then(r => r.data),
    enabled: !!profile?.id,
  })
  const { data: feeData } = useQuery({
    queryKey: ["student-fee", profile?.id],
    queryFn: () => feesApi.getByStudent(profile.id).then(r => r.data),
    enabled: !!profile?.id,
  })
  const { data: marks = [] } = useQuery({
    queryKey: ["student-marks", profile?.id],
    queryFn: () => marksApi.list({ student_id: profile.id }).then(r => r.data),
    enabled: !!profile?.id,
  })

  if (loadP) return <LoadingPage />

  const avgMarks = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.marks_obtained / (m.total_marks || 100)) * 100, 0) / marks.length)
    : 0

  const attPieData = [
    { name: "Present", value: attSummary?.present || 0, color: "#10b981" },
    { name: "Absent", value: attSummary?.absent || 0, color: "#ef4444" },
    { name: "Late", value: attSummary?.late || 0, color: "#f59e0b" },
  ]

  return (
    <div className="page-container">
      {/* Profile Card */}
      <div className="glass-card p-6 mb-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {profile?.name?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{profile?.name}</h1>
          <p className="text-muted-foreground">Roll No: <span className="text-foreground font-medium">{profile?.roll_number}</span></p>
          <p className="text-muted-foreground">Class: <span className="text-foreground font-medium">{profile?.class_name}</span> · Section: <span className="text-foreground font-medium">{profile?.section}</span> · Medium: <span className="text-foreground font-medium">{profile?.medium === "Kannada" ? "Kannada Medium" : "English Medium"}</span></p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">C.N.Mugalkod Schools</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Active Student</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Attendance" value={`${attSummary?.percentage || 0}%`} icon={Calendar} color="blue" subtitle={`${attSummary?.present || 0} days present`} />
        <StatCard title="Performance" value={`${avgMarks}%`} icon={TrendingUp} color="green" subtitle={`${marks.length} exams`} />
        <StatCard title="Total Fees" value={formatCurrency(feeData?.total_amount)} icon={CreditCard} color="purple" />
        <StatCard title="Fee Pending" value={formatCurrency(feeData?.remaining_amount)} icon={CreditCard} color={feeData?.remaining_amount > 0 ? "red" : "green"} subtitle={feeData?.remaining_amount <= 0 ? "Fully paid ✓" : "Due"} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
          <CardContent>
            {attSummary?.total === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No attendance records yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={attPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {attPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-2">
                  <div className="text-center"><p className="text-2xl font-bold text-green-400">{attSummary?.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-red-400">{attSummary?.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-primary">{attSummary?.percentage}%</p><p className="text-xs text-muted-foreground">Overall</p></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
          <CardContent>
            {!feeData ? (
              <p className="text-muted-foreground text-sm text-center py-8">No fee record found</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Total Fee", value: formatCurrency(feeData.total_amount), color: "text-foreground" },
                  { label: "Amount Paid", value: formatCurrency(feeData.paid_amount), color: "text-green-400" },
                  { label: "Remaining", value: formatCurrency(feeData.remaining_amount), color: feeData.remaining_amount > 0 ? "text-red-400" : "text-green-400" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Payment Progress</span>
                    <span>{Math.round((feeData.paid_amount / feeData.total_amount) * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(feeData.paid_amount / feeData.total_amount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
