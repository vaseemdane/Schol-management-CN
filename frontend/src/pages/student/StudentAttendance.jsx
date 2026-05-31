import { useQuery } from "@tanstack/react-query"
import { attendanceApi, studentsApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Calendar } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { formatDate } from "@/lib/utils"

export default function StudentAttendance() {
  const { data: profile } = useQuery({ queryKey: ["student-me"], queryFn: () => studentsApi.getMe().then(r => r.data) })

  const { data: summary, isLoading } = useQuery({
    queryKey: ["student-att-summary", profile?.id],
    queryFn: () => attendanceApi.studentSummary(profile.id).then(r => r.data),
    enabled: !!profile?.id,
  })

  const { data: records = [] } = useQuery({
    queryKey: ["student-att-records", profile?.id],
    queryFn: () => attendanceApi.list({ student_id: profile.id }).then(r => r.data),
    enabled: !!profile?.id,
  })

  if (isLoading) return <LoadingPage />

  const pieData = [
    { name: "Present", value: summary?.present || 0, color: "#10b981" },
    { name: "Absent", value: summary?.absent || 0, color: "#ef4444" },
    { name: "Late", value: summary?.late || 0, color: "#f59e0b" },
  ]

  const monthlyData = summary?.monthly || []

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Attendance Record</h1>
          <p className="section-subtitle">Your attendance history and statistics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card">
          <span className="text-2xl font-bold text-primary">{summary?.percentage || 0}%</span>
          <span className="text-muted-foreground text-sm">Overall</span>
        </div>
      </div>

      {summary?.total === 0 ? (
        <EmptyState title="No attendance records yet" icon={Calendar} />
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Attendance Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-4">
                  <div className="text-center"><p className="text-xl font-bold text-green-400">{summary?.present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                  <div className="text-center"><p className="text-xl font-bold text-red-400">{summary?.absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                  <div className="text-center"><p className="text-xl font-bold text-yellow-400">{summary?.late}</p><p className="text-xs text-muted-foreground">Late</p></div>
                  <div className="text-center"><p className="text-xl font-bold text-foreground">{summary?.total}</p><p className="text-xs text-muted-foreground">Total</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent records */}
          <Card>
            <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {records.slice(0, 30).map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{formatDate(r.date)}</span>
                    </div>
                    <Badge variant={r.status === "present" ? "success" : r.status === "late" ? "warning" : "error"}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
