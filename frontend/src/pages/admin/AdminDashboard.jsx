import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/api"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage } from "@/components/ui/loading"
import { Select } from "@/components/ui/input"
import { Users, UserCheck, BookOpen, CreditCard, DollarSign, Activity } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts"

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

export default function AdminDashboard() {
  const [medium, setMedium] = useState("All")
  const params = medium !== "All" ? { medium } : {}

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["admin-dashboard", medium],
    queryFn: () => analyticsApi.dashboard(params).then(r => r.data),
  })

  const { data: analytics } = useQuery({
    queryKey: ["admin-student-analytics", medium],
    queryFn: () => analyticsApi.students(params).then(r => r.data),
  })

  const { data: financial } = useQuery({
    queryKey: ["admin-financial", medium],
    queryFn: () => analyticsApi.financial(params).then(r => r.data),
  })

  const { data: attendance } = useQuery({
    queryKey: ["admin-attendance-overview", medium],
    queryFn: () => analyticsApi.attendanceOverview(params).then(r => r.data),
  })

  if (loadingDash) return <LoadingPage />

  const feeData = [
    { name: "Collected", value: dashboard?.fees_collected || 0, color: "#10b981" },
    { name: "Pending", value: dashboard?.pending_fees || 0, color: "#ef4444" },
  ]

  const salaryMonthly = financial?.salary_expenses?.slice(-6) || []

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Welcome back! Here's what's happening at C.N.Mugalkod Schools today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={medium} onChange={e => setMedium(e.target.value)} className="w-40">
            <option value="All">All Mediums</option>
            <option value="English">English Medium</option>
            <option value="Kannada">Kannada Medium</option>
          </Select>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Students" value={dashboard?.total_students || 0} icon={Users} color="blue" />
        <StatCard title="Total Teachers" value={dashboard?.total_teachers || 0} icon={UserCheck} color="purple" />
        <StatCard title="Total Classes" value={dashboard?.total_classes || 0} icon={BookOpen} color="cyan" />
        <StatCard title="Fees Collected" value={`₹${((dashboard?.fees_collected || 0) / 1000).toFixed(0)}K`} icon={CreditCard} color="green" />
        <StatCard title="Pending Fees" value={`₹${((dashboard?.pending_fees || 0) / 1000).toFixed(0)}K`} icon={DollarSign} color="orange" />
        <StatCard title="Attendance %" value={`${dashboard?.attendance_percentage || 0}%`} icon={Activity} color="pink" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Fee pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {feeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance by class */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendance?.slice(0, 6) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                <XAxis dataKey="class" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Salary expense trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Salary Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salaryMonthly}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#salaryGrad)" name="Salary Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top students */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics?.top_students || []).slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    i === 1 ? "bg-gray-500/20 text-gray-300" :
                    i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Roll: {s.roll_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">{s.average}%</p>
                  </div>
                </div>
              ))}
              {!(analytics?.top_students?.length) && (
                <p className="text-muted-foreground text-sm text-center py-6">No data yet. Add students and marks.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
