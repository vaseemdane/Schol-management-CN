import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { classesApi, subjectsApi, teachersApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Plus, BookOpen, Layers, Trash2 } from "lucide-react"

export default function ClassesSubjects() {
  const qc = useQueryClient()
  const [tab, setTab] = useState("classes")
  const [modalClass, setModalClass] = useState(false)
  const [modalSubject, setModalSubject] = useState(false)

  const [className, setClassName] = useState("")
  const [classSection, setClassSection] = useState("")
  const [classMedium, setClassMedium] = useState("English")
  const [classTeacherId, setClassTeacherId] = useState("")

  const { data: classes = [], isLoading: loadC } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })
  const { data: subjects = [], isLoading: loadS } = useQuery({ queryKey: ["subjects-all"], queryFn: () => subjectsApi.list().then(r => r.data) })
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => teachersApi.list().then(r => r.data) })

  const createClass = useMutation({ mutationFn: classesApi.create, onSuccess: () => { qc.invalidateQueries(["classes"]); setModalClass(false) } })
  const createSubject = useMutation({ mutationFn: subjectsApi.create, onSuccess: () => { qc.invalidateQueries(["subjects-all"]); setModalSubject(false) } })

  const deleteClass = useMutation({
    mutationFn: classesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(["classes"])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || "Failed to delete class.")
    }
  })

  const deleteSubject = useMutation({
    mutationFn: subjectsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(["subjects-all"])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || "Failed to delete subject.")
    }
  })

  if (loadC || loadS) return <LoadingPage />

  const filteredTeachers = teachers.filter(t => t.medium === classMedium)

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Classes & Subjects</h1>
          <p className="section-subtitle">Manage school classes and subjects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalSubject(true)}><Plus className="w-4 h-4 mr-1" />Subject</Button>
          <Button onClick={() => { setClassName(""); setClassSection(""); setClassMedium("English"); setClassTeacherId(""); setModalClass(true); }}><Plus className="w-4 h-4 mr-1" />Class</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-6">
        {[["classes", BookOpen, "Classes"], ["subjects", Layers, "Subjects"]].map(([k, Icon, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "classes" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Class Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 && <TableRow><td colSpan={6} className="py-12"><EmptyState title="No classes added" icon={BookOpen} /></td></TableRow>}
            {classes.map((c, i) => {
              const teacher = teachers.find(t => t.id === c.teacher_id)
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell><Badge variant="info">{c.section}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={c.medium === "Kannada" ? "purple" : "default"}>
                      {c.medium === "Kannada" ? "Kannada Medium" : "English Medium"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{teacher?.name || "—"}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        if (confirm(`Delete class ${c.name} - ${c.section}?`)) {
                          deleteClass.mutate(c.id)
                        }
                      }}
                      className="btn-icon text-red-400 hover:bg-red-500/10"
                      disabled={deleteClass.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {tab === "subjects" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 && <TableRow><td colSpan={4} className="py-12"><EmptyState title="No subjects added" icon={Layers} /></td></TableRow>}
            {subjects.map((s, i) => {
              const cls = classes.find(c => c.id === s.class_id)
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cls ? `${cls.name} ${cls.section}` : "—"}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject ${s.name}?`)) {
                          deleteSubject.mutate(s.id)
                        }
                      }}
                      className="btn-icon text-red-400 hover:bg-red-500/10"
                      disabled={deleteSubject.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Class modal */}
      <Modal isOpen={modalClass} onClose={() => setModalClass(false)} title="Add Class">
        <form onSubmit={e => { e.preventDefault(); createClass.mutate({ name: className, section: classSection, medium: classMedium, teacher_id: classTeacherId ? +classTeacherId : null }) }} className="space-y-4">
          <FormField label="Class Name *"><Input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Class 10" required /></FormField>
          <FormField label="Section *"><Input value={classSection} onChange={e => setClassSection(e.target.value)} placeholder="e.g. A" required /></FormField>
          <FormField label="Medium *">
            <Select value={classMedium} onChange={e => { setClassMedium(e.target.value); setClassTeacherId("") }} required>
              <option value="English">English Medium</option>
              <option value="Kannada">Kannada Medium</option>
            </Select>
          </FormField>
          <FormField label="Class Teacher">
            <Select value={classTeacherId} onChange={e => setClassTeacherId(e.target.value)}>
              <option value="">No teacher assigned</option>
              {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={createClass.isPending} className="flex-1">{createClass.isPending ? "Adding..." : "Add Class"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalClass(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Subject modal */}
      <Modal isOpen={modalSubject} onClose={() => setModalSubject(false)} title="Add Subject">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); createSubject.mutate({ name: fd.get("name"), class_id: +fd.get("class_id") }) }} className="space-y-4">
          <FormField label="Subject Name *"><Input name="name" placeholder="e.g. Mathematics" required /></FormField>
          <FormField label="Class *">
            <Select name="class_id" required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={createSubject.isPending} className="flex-1">{createSubject.isPending ? "Adding..." : "Add Subject"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalSubject(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
