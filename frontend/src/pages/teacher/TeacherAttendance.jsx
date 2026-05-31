import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceApi, studentsApi, classesApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { CalendarCheck, CheckCircle, XCircle, Clock } from "lucide-react"

export default function TeacherAttendance() {
  const qc = useQueryClient()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [statusMap, setStatusMap] = useState({})
  const [saving, setSaving] = useState(false)

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })

  const classStudents = students.filter(s => s.class_id === +selectedClass)

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["attendance", selectedClass, selectedDate],
    queryFn: () => attendanceApi.list({ class_id: selectedClass, date_from: selectedDate, date_to: selectedDate }).then(r => r.data),
    enabled: !!selectedClass,
    onSuccess: (data) => {
      const map = {}
      data.forEach(r => { map[r.student_id] = r.status })
      setStatusMap(map)
    }
  })

  const setAll = (status) => {
    const map = {}
    classStudents.forEach(s => { map[s.id] = status })
    setStatusMap(map)
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return
    setSaving(true)
    try {
      const records = classStudents.map(s => ({
        student_id: s.id,
        status: statusMap[s.id] || "present",
      }))
      await attendanceApi.bulkMark({ class_id: +selectedClass, date: selectedDate, records })
      qc.invalidateQueries(["attendance"])
      alert("Attendance saved successfully!")
    } catch (e) {
      alert("Error saving attendance")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Attendance Management</h1>
          <p className="section-subtitle">Mark and manage student attendance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField label="Select Class">
            <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">— Choose Class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </FormField>
          <FormField label="Bulk Actions">
            <div className="flex gap-2">
              <button onClick={() => setAll("present")} className="flex-1 btn btn-secondary btn-sm text-green-400 border-green-500/20 hover:bg-green-500/10">All Present</button>
              <button onClick={() => setAll("absent")} className="flex-1 btn btn-secondary btn-sm text-red-400 border-red-500/20 hover:bg-red-500/10">All Absent</button>
            </div>
          </FormField>
        </div>
      </div>

      {/* Attendance Table */}
      {!selectedClass ? (
        <EmptyState title="Select a class to mark attendance" icon={CalendarCheck} />
      ) : classStudents.length === 0 ? (
        <EmptyState title="No students in this class" icon={CalendarCheck} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStudents.map((s, i) => {
                const status = statusMap[s.id] || "present"
                return (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell><Badge variant="default">{s.roll_number}</Badge></TableCell>
                    <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {[
                          { v: "present", icon: CheckCircle, color: "text-green-400 bg-green-500/10 border-green-500/20" },
                          { v: "absent", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
                          { v: "late", icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                        ].map(({ v, icon: Icon, color }) => (
                          <button
                            key={v}
                            onClick={() => setStatusMap(p => ({ ...p, [s.id]: v }))}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${status === v ? color : "text-muted-foreground border-border/50 hover:border-border"}`}
                          >
                            <Icon className="w-3 h-3" /> {v}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="text-green-400">✓ Present: {Object.values(statusMap).filter(s => s === "present").length}</span>
              <span className="text-red-400">✗ Absent: {Object.values(statusMap).filter(s => s === "absent").length}</span>
              <span className="text-yellow-400">⏱ Late: {Object.values(statusMap).filter(s => s === "late").length}</span>
            </div>
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
