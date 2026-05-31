import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { marksApi, examsApi, studentsApi, classesApi, subjectsApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField, Select, Textarea } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { getGradeBadgeClass } from "@/lib/utils"
import { Plus, Edit2, Trash2, FileText } from "lucide-react"

export default function TeacherResults() {
  const qc = useQueryClient()
  const [tab, setTab] = useState("marks")
  const [modalMark, setModalMark] = useState(false)
  const [modalExam, setModalExam] = useState(false)
  const [editMark, setEditMark] = useState(null)
  const [filterExam, setFilterExam] = useState("")

  const { data: marks = [], isLoading } = useQuery({ queryKey: ["marks-all"], queryFn: () => marksApi.list({}).then(r => r.data) })
  const { data: exams = [] } = useQuery({ queryKey: ["exams-all"], queryFn: () => examsApi.list({}).then(r => r.data) })
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects-all"], queryFn: () => subjectsApi.list().then(r => r.data) })

  const addMark = useMutation({ mutationFn: marksApi.add, onSuccess: () => { qc.invalidateQueries(["marks-all"]); setModalMark(false) } })
  const updateMark = useMutation({ mutationFn: ({ id, data }) => marksApi.update(id, data), onSuccess: () => { qc.invalidateQueries(["marks-all"]); setEditMark(null) } })
  const deleteMark = useMutation({ mutationFn: marksApi.delete, onSuccess: () => qc.invalidateQueries(["marks-all"]) })
  const addExam = useMutation({ mutationFn: examsApi.create, onSuccess: () => { qc.invalidateQueries(["exams-all"]); setModalExam(false) } })

  const filteredMarks = filterExam ? marks.filter(m => m.exam_id === +filterExam) : marks

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Exam Results Management</h1>
          <p className="section-subtitle">Add and manage student exam marks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalExam(true)}><Plus className="w-4 h-4 mr-1" />Add Exam</Button>
          <Button onClick={() => setModalMark(true)}><Plus className="w-4 h-4 mr-1" />Add Marks</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-6">
        {[["marks", "Marks Entry"], ["exams", "Exams List"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "marks" && (
        <>
          <div className="mb-4 max-w-xs">
            <Select value={filterExam} onChange={e => setFilterExam(e.target.value)}>
              <option value="">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name} — {e.subject_name}</option>)}
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMarks.length === 0 && <TableRow><td colSpan={7} className="py-12"><EmptyState title="No marks entered" icon={FileText} /></td></TableRow>}
              {filteredMarks.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-foreground">{m.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.exam_name}</TableCell>
                  <TableCell><Badge variant="info">{m.subject_name}</Badge></TableCell>
                  <TableCell className="font-semibold">{m.marks_obtained}/{m.total_marks}</TableCell>
                  <TableCell><Badge className={getGradeBadgeClass(m.grade)}>{m.grade || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{m.remarks || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => setEditMark(m)} className="btn-icon"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("Delete this mark?")) deleteMark.mutate(m.id) }} className="btn-icon text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {tab === "exams" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 && <TableRow><td colSpan={5} className="py-12"><EmptyState title="No exams created" icon={FileText} /></td></TableRow>}
            {exams.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                <TableCell className="text-muted-foreground">{e.class_name}</TableCell>
                <TableCell><Badge variant="purple">{e.subject_name}</Badge></TableCell>
                <TableCell>{e.total_marks}</TableCell>
                <TableCell className="text-muted-foreground">{e.exam_date || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Mark Modal */}
      <Modal isOpen={modalMark} onClose={() => setModalMark(false)} title="Add Marks">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addMark.mutate({ student_id: +fd.get("student_id"), exam_id: +fd.get("exam_id"), marks_obtained: +fd.get("marks_obtained"), remarks: fd.get("remarks") }) }} className="space-y-4">
          <FormField label="Student *">
            <Select name="student_id" required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </Select>
          </FormField>
          <FormField label="Exam *">
            <Select name="exam_id" required>
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name} — {e.subject_name} (/{e.total_marks})</option>)}
            </Select>
          </FormField>
          <FormField label="Marks Obtained *">
            <Input name="marks_obtained" type="number" step="0.5" placeholder="Enter marks" required />
          </FormField>
          <FormField label="Remarks">
            <Textarea name="remarks" placeholder="Optional remarks" />
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={addMark.isPending} className="flex-1">{addMark.isPending ? "Saving..." : "Save Marks"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalMark(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Mark Modal */}
      <Modal isOpen={!!editMark} onClose={() => setEditMark(null)} title="Update Marks">
        {editMark && (
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); updateMark.mutate({ id: editMark.id, data: { marks_obtained: +fd.get("marks_obtained"), remarks: fd.get("remarks") } }) }} className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="font-medium text-foreground">{editMark.student_name}</p>
              <p className="text-muted-foreground">{editMark.exam_name} — {editMark.subject_name} (Total: {editMark.total_marks})</p>
            </div>
            <FormField label="Marks Obtained *">
              <Input name="marks_obtained" type="number" step="0.5" defaultValue={editMark.marks_obtained} required />
            </FormField>
            <FormField label="Remarks">
              <Textarea name="remarks" defaultValue={editMark.remarks} />
            </FormField>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMark.isPending} className="flex-1">{updateMark.isPending ? "Updating..." : "Update Marks"}</Button>
              <Button type="button" variant="secondary" onClick={() => setEditMark(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Exam Modal */}
      <Modal isOpen={modalExam} onClose={() => setModalExam(false)} title="Create Exam">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addExam.mutate({ name: fd.get("name"), class_id: +fd.get("class_id"), subject_id: +fd.get("subject_id"), total_marks: +fd.get("total_marks"), exam_date: fd.get("exam_date") || null }) }} className="space-y-4">
          <FormField label="Exam Name *"><Input name="name" placeholder="e.g. Mid-Term 2024" required /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Class *">
              <Select name="class_id" required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </Select>
            </FormField>
            <FormField label="Subject *">
              <Select name="subject_id" required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Total Marks *"><Input name="total_marks" type="number" defaultValue="100" required /></FormField>
            <FormField label="Exam Date"><Input name="exam_date" type="date" /></FormField>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={addExam.isPending} className="flex-1">{addExam.isPending ? "Creating..." : "Create Exam"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalExam(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
