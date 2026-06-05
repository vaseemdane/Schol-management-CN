import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentsApi, classesApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, Select, FormField, Textarea } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Plus, Search, Edit2, Trash2, Eye, Users } from "lucide-react"

function StudentForm({ initial, classes, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        ...initial,
        dob: initial.dob || "",
      }
    }
    return {
      name: "", mobile: "", password: "", roll_number: "",
      class_id: "", section: "", parent_name: "", parent_mobile: "", address: "",
      medium: "English",
      dob: "",
    }
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const filteredClasses = classes?.filter(c => c.medium === form.medium)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name *">
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Student name" required />
        </FormField>
        <FormField label="Roll Number *">
          <Input value={form.roll_number} onChange={e => set("roll_number", e.target.value)} placeholder="e.g. 2024001" required />
        </FormField>
        {!initial && (
          <>
            <FormField label="Mobile Number *">
              <Input value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="10-digit mobile" required />
            </FormField>
            <FormField label="Password *">
              <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Login password" required={!initial} />
            </FormField>
          </>
        )}
        <FormField label="Medium *">
          <Select value={form.medium} onChange={e => { set("medium", e.target.value); set("class_id", "") }} required>
            <option value="English">English Medium</option>
            <option value="Kannada">Kannada Medium</option>
          </Select>
        </FormField>
        <FormField label="Class *">
          <Select value={form.class_id} onChange={e => set("class_id", e.target.value)} required>
            <option value="">Select Class</option>
            {filteredClasses?.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </Select>
        </FormField>
        <FormField label="Section *">
          <Input value={form.section} onChange={e => set("section", e.target.value)} placeholder="e.g. A" required />
        </FormField>
        <FormField label="Date of Birth *">
          <Input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} required />
        </FormField>
        <FormField label="Parent Name">
          <Input value={form.parent_name} onChange={e => set("parent_name", e.target.value)} placeholder="Parent/Guardian name" />
        </FormField>
        <FormField label="Parent Mobile">
          <Input value={form.parent_mobile} onChange={e => set("parent_mobile", e.target.value)} placeholder="Parent mobile" />
        </FormField>
      </div>
      <FormField label="Address">
        <Textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full address" />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save Student"}</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

export default function StudentsManagement() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [mediumFilter, setMediumFilter] = useState("All")
  const [modalAdd, setModalAdd] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalView, setModalView] = useState(null)

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", mediumFilter],
    queryFn: () => studentsApi.list(mediumFilter !== "All" ? { medium: mediumFilter } : {}).then(r => r.data),
  })
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })

  const createMut = useMutation({ mutationFn: studentsApi.create, onSuccess: () => { qc.invalidateQueries(["students"]); setModalAdd(false) } })
  const updateMut = useMutation({ mutationFn: ({ id, data }) => studentsApi.update(id, data), onSuccess: () => { qc.invalidateQueries(["students"]); setModalEdit(null) } })
  const deleteMut = useMutation({ mutationFn: studentsApi.delete, onSuccess: () => qc.invalidateQueries(["students"]) })

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Students Management</h1>
          <p className="section-subtitle">{students.length} students enrolled</p>
        </div>
        <Button onClick={() => setModalAdd(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      {/* Medium Filter tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-6">
        {["All", "English", "Kannada"].map(m => (
          <button
            key={m}
            onClick={() => setMediumFilter(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mediumFilter === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "All" ? "All Mediums" : m === "English" ? "English Medium" : "Kannada Medium"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10" placeholder="Search by name, roll, class..." />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Medium</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <td colSpan={8} className="py-12">
                <EmptyState title="No students found" description="Add student using the button above." icon={Users} />
              </td>
            </TableRow>
          )}
          {filtered.map((s, i) => (
            <TableRow key={s.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium text-foreground">{s.name}</TableCell>
              <TableCell><Badge variant="default">{s.roll_number}</Badge></TableCell>
              <TableCell>{s.class_name || "—"}</TableCell>
              <TableCell>
                <Badge variant={s.medium === "Kannada" ? "purple" : "info"}>
                  {s.medium === "Kannada" ? "Kannada Medium" : "English Medium"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{s.mobile || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{s.parent_name || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModalView(s)} className="btn-icon"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => setModalEdit(s)} className="btn-icon"><Edit2 className="w-4 h-4" /></button>
                  <button
                    onClick={() => { if (confirm(`Delete student ${s.name}?`)) deleteMut.mutate(s.id) }}
                    className="btn-icon text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Modal */}
      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Add New Student" size="lg">
        <StudentForm classes={classes} onSubmit={d => createMut.mutate(d)} onClose={() => setModalAdd(false)} loading={createMut.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Student" size="lg">
        {modalEdit && (
          <StudentForm
            initial={modalEdit}
            classes={classes}
            onSubmit={d => updateMut.mutate({ id: modalEdit.id, data: d })}
            onClose={() => setModalEdit(null)}
            loading={updateMut.isPending}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!modalView} onClose={() => setModalView(null)} title="Student Profile">
        {modalView && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white">
                {modalView.name?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{modalView.name}</h2>
                <p className="text-muted-foreground">Roll No: {modalView.roll_number}</p>
              </div>
            </div>
            {[
              ["Class", modalView.class_name],
              ["Section", modalView.section],
              ["Medium", modalView.medium],
              ["Date of Birth", modalView.dob],
              ["Mobile", modalView.mobile],
              ["Parent Name", modalView.parent_name],
              ["Parent Mobile", modalView.parent_mobile],
              ["Address", modalView.address],
            ].map(([k, v]) => v && (
              <div key={k} className="flex items-start gap-3">
                <span className="text-muted-foreground text-sm w-28 flex-shrink-0">{k}</span>
                <span className="text-foreground text-sm">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
