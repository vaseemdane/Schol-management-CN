import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage } from "@/components/ui/loading"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts"

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

export default function Analytics() {
  const { data: dashboard } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => analyticsApi.dashboard().then(r => r.data) })
  const { data: students, isLoading } = useQuery({ queryKey: ["admin-student-analytics"], queryFn: () => analyticsApi.students().then(r => r.data) })
  const { data: financial } = useQuery({ queryKey: ["admin-financial"], queryFn: () => analyticsApi.financial().then(r => r.data) })
  const { data: attendance } = useQuery({ queryKey: ["admin-attendance-overview"], queryFn: () => analyticsApi.attendanceOverview().then(r => r.data) })

  if (isLoading) return <LoadingPage />

  const feeDonut = [
    { name: "Collected", value: financial?.total_collected || 0 },
    { name: "Pending", value: financial?.total_pending || 0 },
  ]

  const classSizes = (students?.class_data || []).map(c => ({ name: c.class, students: c.total_students }))

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-subtitle">Comprehensive school performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Students per class */}
        <Card>
          <CardHeader><CardTitle>Students per Class</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classSizes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee collection pie */}
        <Card>
          <CardHeader><CardTitle>Fee Collection Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={feeDonut} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} formatter={v => `₹${v.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-green-400">{financial?.collection_percentage || 0}%</p>
              <p className="text-xs text-muted-foreground">Collection rate</p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance by class */}
        <Card>
          <CardHeader><CardTitle>Class-wise Attendance (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                <YAxis type="category" dataKey="class" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} width={80} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salary trend */}
        <Card>
          <CardHeader><CardTitle>Monthly Salary Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={financial?.salary_expenses || []}>
                <defs>
                  <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} formatter={v => `₹${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="amount" stroke="#f59e0b" fill="url(#salGrad)" name="Salary Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top students table */}
      <Card>
        <CardHeader><CardTitle>Top 10 Performers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(students?.top_students || []).map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? "bg-yellow-500/25 text-yellow-400" :
                  i === 1 ? "bg-gray-400/25 text-gray-300" :
                  i === 2 ? "bg-orange-500/25 text-orange-400" : "bg-secondary text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Roll: {s.roll_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${s.average}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-blue-400 w-12 text-right">{s.average}%</span>
                </div>
              </div>
            ))}
            {!students?.top_students?.length && <p className="text-muted-foreground text-sm text-center py-6">No performance data yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
