import { useQuery } from "@tanstack/react-query"
import { studentsApi, marksApi, attendanceApi, classesApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

export default function TeacherAnalytics() {
  const { data: students = [], isLoading } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })
  const { data: marks = [] } = useQuery({ queryKey: ["marks-all"], queryFn: () => marksApi.list({}).then(r => r.data) })
  const { data: attendance = [] } = useQuery({ queryKey: ["attendance-all"], queryFn: () => attendanceApi.list({}).then(r => r.data) })
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })

  // Calculate per-student stats
  const studentStats = students.map(s => {
    const sMarks = marks.filter(m => m.student_id === s.id)
    const sAtt = attendance.filter(a => a.student_id === s.id)
    const avg = sMarks.length ? sMarks.reduce((sum, m) => sum + ((m.marks_obtained / (m.total_marks || 100)) * 100), 0) / sMarks.length : null
    const attPct = sAtt.length ? (sAtt.filter(a => a.status === "present").length / sAtt.length) * 100 : null

    return {
      id: s.id, name: s.name, roll: s.roll_number,
      average: avg !== null ? Math.round(avg) : null,
      attendance: attPct !== null ? Math.round(attPct) : null,
      class_id: s.class_id,
    }
  }).filter(s => s.average !== null)

  const topPerformers = [...studentStats].sort((a, b) => b.average - a.average).slice(0, 5)
  const lowPerformers = [...studentStats].sort((a, b) => a.average - b.average).slice(0, 5)
  const attendanceRisk = studentStats.filter(s => s.attendance !== null && s.attendance < 75)

  const classPerf = classes.map(c => {
    const cs = studentStats.filter(s => s.class_id === c.id)
    return {
      name: `${c.name} ${c.section}`,
      average: cs.length ? Math.round(cs.reduce((s, x) => s + x.average, 0) / cs.length) : 0,
    }
  })

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Student Analytics</h1>
          <p className="section-subtitle">Performance and attendance insights</p>
        </div>
      </div>

      {/* Class-wise performance chart */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Class-wise Average Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={classPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
              <Bar dataKey="average" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Average %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top performers */}
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
              {topPerformers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                  <span className="text-xs font-bold text-green-400 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Roll: {s.roll}</p>
                  </div>
                  <Badge variant="success">{s.average}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low performers */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <TrendingDown className="w-4 h-4" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowPerformers.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
              {lowPerformers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-xs font-bold text-red-400 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Roll: {s.roll}</p>
                  </div>
                  <Badge variant="error">{s.average}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance risk */}
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-4 h-4" /> Attendance Risk (&lt;75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceRisk.length === 0 && <p className="text-muted-foreground text-sm">All students have adequate attendance ✓</p>}
              {attendanceRisk.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Roll: {s.roll}</p>
                  </div>
                  <Badge variant="warning">{s.attendance}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
