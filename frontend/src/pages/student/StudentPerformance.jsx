import { useQuery } from "@tanstack/react-query"
import { marksApi, studentsApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { TrendingUp } from "lucide-react"
import { getGradeBadgeClass } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts"

export default function StudentPerformance() {
  const { data: profile } = useQuery({ queryKey: ["student-me"], queryFn: () => studentsApi.getMe().then(r => r.data) })

  const { data: marks = [], isLoading } = useQuery({
    queryKey: ["student-marks", profile?.id],
    queryFn: () => marksApi.list({ student_id: profile.id }).then(r => r.data),
    enabled: !!profile?.id,
  })

  // Group by subject for bar chart
  const subjectData = {}
  marks.forEach(m => {
    if (!subjectData[m.subject_name]) subjectData[m.subject_name] = { subject: m.subject_name, total: 0, count: 0 }
    subjectData[m.subject_name].total += (m.marks_obtained / (m.total_marks || 100)) * 100
    subjectData[m.subject_name].count++
  })
  const barData = Object.values(subjectData).map(s => ({ name: s.subject, average: Math.round(s.total / s.count) }))

  // Trend line (exam chronological)
  const trendData = marks.map((m, i) => ({
    exam: m.exam_name || `Exam ${i + 1}`,
    percentage: Math.round((m.marks_obtained / (m.total_marks || 100)) * 100),
    subject: m.subject_name,
  }))

  const overallAvg = marks.length ? Math.round(marks.reduce((s, m) => s + (m.marks_obtained / (m.total_marks || 100)) * 100, 0) / marks.length) : 0

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Academic Performance</h1>
          <p className="section-subtitle">Your subject-wise marks and performance trends</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card">
          <span className="text-2xl font-bold text-green-400">{overallAvg}%</span>
          <span className="text-muted-foreground text-sm">Overall Avg</span>
        </div>
      </div>

      {marks.length === 0 ? (
        <EmptyState title="No marks entered yet" description="Your teacher will enter your exam marks soon." icon={TrendingUp} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Subject-wise bar chart */}
            <Card>
              <CardHeader><CardTitle>Subject-wise Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                    <Bar dataKey="average" fill="#10b981" radius={[4, 4, 0, 0]} name="Average %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance trend */}
            <Card>
              <CardHeader><CardTitle>Performance Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 32% 22%)" />
                    <XAxis dataKey="exam" tick={{ fontSize: 9, fill: "hsl(215 20% 65%)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(222 47% 14%)", border: "1px solid hsl(217 32% 22%)", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="Score %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Marks table */}
          <Card>
            <CardHeader><CardTitle>Detailed Marks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {marks.map(m => {
                  const pct = Math.round((m.marks_obtained / (m.total_marks || 100)) * 100)
                  return (
                    <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{m.subject_name}</p>
                        <p className="text-xs text-muted-foreground">{m.exam_name}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">{m.marks_obtained}/{m.total_marks}</p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                      <Badge className={getGradeBadgeClass(m.grade)}>{m.grade || "—"}</Badge>
                      <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                        <div className={`h-full rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
