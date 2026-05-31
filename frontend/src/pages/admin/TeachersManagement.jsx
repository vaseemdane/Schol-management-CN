import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teachersApi, classesApi, subjectsApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, Select, FormField } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Plus, Search, Edit2, Trash2, UserCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

function TeacherForm({ initial, classes, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    name: "", mobile: "", password: "", qualification: "", monthly_salary: "",
    assigned_classes: [], assigned_subjects: [],
    medium: "English",
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, monthly_salary: parseFloat(form.monthly_salary) || 0 }) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name *">
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Teacher name" required />
        </FormField>
        <FormField label="Qualification">
          <Input value={form.qualification} onChange={e => set("qualification", e.target.value)} placeholder="e.g. M.Sc, B.Ed" />
        </FormField>
        {!initial && (
          <>
            <FormField label="Mobile Number *">
              <Input value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="10-digit mobile" required />
            </FormField>
            <FormField label="Password *">
              <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Login password" required />
            </FormField>
          </>
        )}
        <FormField label="Medium *">
          <Select value={form.medium} onChange={e => set("medium", e.target.value)} required>
            <option value="English">English Medium</option>
            <option value="Kannada">🏫 Kannada Medium</option>
          </Select>
        </FormField>
        <FormField label="Monthly Salary (₹)">
          <Input type="number" value={form.monthly_salary} onChange={e => set("monthly_salary", e.target.value)} placeholder="e.g. 30000" />
        </FormField>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save Teacher"}</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

export default function TeachersManagement() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [mediumFilter, setMediumFilter] = useState("All")
  const [modalAdd, setModalAdd] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers", mediumFilter],
    queryFn: () => teachersApi.list(mediumFilter !== "All" ? { medium: mediumFilter } : {}).then(r => r.data),
  })
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.list().then(r => r.data) })

  const createMut = useMutation({ mutationFn: teachersApi.create, onSuccess: () => { qc.invalidateQueries(["teachers"]); setModalAdd(false) } })
  const updateMut = useMutation({ mutationFn: ({ id, data }) => teachersApi.update(id, data), onSuccess: () => { qc.invalidateQueries(["teachers"]); setModalEdit(null) } })
  const deleteMut = useMutation({ mutationFn: teachersApi.delete, onSuccess: () => qc.invalidateQueries(["teachers"]) })

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.mobile?.includes(search) ||
    t.qualification?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Teachers Management</h1>
          <p className="section-subtitle">{teachers.length} teachers registered</p>
        </div>
        <Button onClick={() => setModalAdd(true)}><Plus className="w-4 h-4 mr-1" />Add Teacher</Button>
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
            {m === "All" ? "All Mediums" : m === "English" ? "English Medium" : "🏫 Kannada"}
          </button>
        ))}
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10" placeholder="Search teachers..." />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Medium</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Monthly Salary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow><td colSpan={7} className="py-12"><EmptyState title="No teachers found" icon={UserCheck} /></td></TableRow>
          )}
          {filtered.map((t, i) => (
            <TableRow key={t.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium text-foreground">{t.name}</TableCell>
              <TableCell className="text-muted-foreground">{t.mobile}</TableCell>
              <TableCell>
                <Badge variant={t.medium === "Kannada" ? "purple" : "info"}>
                  {t.medium === "Kannada" ? "🏫 Kannada" : "English Medium"}
                </Badge>
              </TableCell>
              <TableCell><Badge variant="purple">{t.qualification || "—"}</Badge></TableCell>
              <TableCell className="text-green-400 font-semibold">{formatCurrency(t.monthly_salary)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModalEdit(t)} className="btn-icon"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm(`Delete teacher ${t.name}?`)) deleteMut.mutate(t.id) }} className="btn-icon text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Add Teacher" size="lg">
        <TeacherForm classes={classes} onSubmit={d => createMut.mutate(d)} onClose={() => setModalAdd(false)} loading={createMut.isPending} />
      </Modal>

      <Modal isOpen={!!modalEdit} onClose={() => setModalEdit(null)} title="Edit Teacher" size="lg">
        {modalEdit && (
          <TeacherForm
            initial={modalEdit}
            classes={classes}
            onSubmit={d => updateMut.mutate({ id: modalEdit.id, data: d })}
            onClose={() => setModalEdit(null)}
            loading={updateMut.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
