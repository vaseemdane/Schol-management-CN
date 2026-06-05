import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { salaryApi, teachersApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, DollarSign, Edit2 } from "lucide-react"

export default function SalaryManagement() {
  const qc = useQueryClient()
  const [modalSalary, setModalSalary] = useState(false)
  const [modalPay, setModalPay] = useState(null)
  const [modalEditSalary, setModalEditSalary] = useState(null)
  const [selectedSalary, setSelectedSalary] = useState(null)

  const { data: salaries = [], isLoading } = useQuery({ queryKey: ["salaries"], queryFn: () => salaryApi.list().then(r => r.data) })
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: () => teachersApi.list().then(r => r.data) })

  const createSalary = useMutation({ mutationFn: salaryApi.create, onSuccess: () => { qc.invalidateQueries(["salaries"]); setModalSalary(false) } })
  const updateSalary = useMutation({ mutationFn: ({ id, data }) => salaryApi.update(id, data), onSuccess: () => { qc.invalidateQueries(["salaries"]); setModalEditSalary(null) } })
  const addPayment = useMutation({ mutationFn: salaryApi.addPayment, onSuccess: () => { qc.invalidateQueries(["salaries"]); setModalPay(null) } })

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Salary Management</h1>
          <p className="section-subtitle">Track teacher salary payments</p>
        </div>
        <Button onClick={() => setModalSalary(true)}><Plus className="w-4 h-4 mr-1" />Add Salary Record</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Monthly Salary</TableHead>
            <TableHead>Total Paid</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salaries.length === 0 && (
            <TableRow><td colSpan={6} className="py-12"><EmptyState title="No salary records" icon={DollarSign} /></td></TableRow>
          )}
          {salaries.map(s => (
            <TableRow key={s.id}>
              <TableCell className="font-medium text-foreground">{s.teacher_name}</TableCell>
              <TableCell className="text-purple-400 font-semibold">{formatCurrency(s.monthly_amount)}</TableCell>
              <TableCell className="text-green-400 font-semibold">{formatCurrency(s.total_paid)}</TableCell>
              <TableCell className={s.pending_amount > 0 ? "text-red-400 font-semibold" : "text-muted-foreground"}>{formatCurrency(s.pending_amount)}</TableCell>
              <TableCell>
                {s.pending_amount <= 0 ? <Badge variant="success">Up to date</Badge> : <Badge variant="warning">Pending</Badge>}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => setModalEditSalary(s)} className="btn-icon p-1.5 hover:bg-secondary rounded" title="Edit Salary Record">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setModalPay(s)} className="btn btn-secondary btn-sm"><Plus className="w-3 h-3" /> Pay</button>
                  <button onClick={() => setSelectedSalary(selectedSalary?.id === s.id ? null : s)} className="btn btn-ghost btn-sm">History</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSalary && (
        <div className="mt-6 glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment History — {selectedSalary.teacher_name}</h3>
          {selectedSalary.payments?.length === 0 && <p className="text-muted-foreground text-sm">No payments recorded yet.</p>}
          <div className="space-y-2">
            {selectedSalary.payments?.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.month}</p>
                  <p className="text-xs text-muted-foreground">Receipt: {p.receipt_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.payment_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={modalSalary} onClose={() => setModalSalary(false)} title="Add Salary Record">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); createSalary.mutate({ teacher_id: +fd.get("teacher_id"), monthly_amount: +fd.get("monthly_amount"), academic_year: fd.get("academic_year") }) }} className="space-y-4">
          <FormField label="Teacher *">
            <Select name="teacher_id" required>
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Monthly Salary (₹) *">
            <Input name="monthly_amount" type="number" placeholder="e.g. 30000" required />
          </FormField>
          <FormField label="Academic Year">
            <Input name="academic_year" defaultValue="2024-25" required />
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={createSalary.isPending} className="flex-1">{createSalary.isPending ? "Adding..." : "Add Record"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalSalary(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!modalPay} onClose={() => setModalPay(null)} title={`Add Salary Payment — ${modalPay?.teacher_name}`}>
        {modalPay && (
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addPayment.mutate({ salary_id: modalPay.id, amount: +fd.get("amount"), month: fd.get("month") }) }} className="space-y-4">
            <FormField label="Month *">
              <Input name="month" placeholder="e.g. May 2024" required />
            </FormField>
            <FormField label="Amount (₹) *">
              <Input name="amount" type="number" placeholder={`Monthly: ₹${modalPay.monthly_amount}`} required />
            </FormField>
            <div className="flex gap-3">
              <Button type="submit" disabled={addPayment.isPending} className="flex-1">{addPayment.isPending ? "Processing..." : "Record Payment"}</Button>
              <Button type="button" variant="secondary" onClick={() => setModalPay(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Salary Modal */}
      <Modal isOpen={!!modalEditSalary} onClose={() => setModalEditSalary(null)} title={`Edit Salary Record — ${modalEditSalary?.teacher_name}`}>
        {modalEditSalary && (
          <form onSubmit={e => {
            e.preventDefault()
            const fd = new FormData(e.target)
            updateSalary.mutate({
              id: modalEditSalary.id,
              data: {
                monthly_amount: +fd.get("monthly_amount"),
                academic_year: fd.get("academic_year")
              }
            })
          }} className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Teacher</span>
                <span className="font-semibold text-foreground">{modalEditSalary.teacher_name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Total Paid (Yearly)</span>
                <span className="font-semibold text-green-400">{formatCurrency(modalEditSalary.total_paid)}</span>
              </div>
            </div>
            <FormField label="Monthly Salary (₹) *">
              <Input 
                name="monthly_amount" 
                type="number" 
                defaultValue={modalEditSalary.monthly_amount} 
                min={modalEditSalary.total_paid / 12}
                placeholder="e.g. 30000" 
                required 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum monthly salary must cover already paid amount (Annual total must be &ge; {formatCurrency(modalEditSalary.total_paid)}).
              </p>
            </FormField>
            <FormField label="Academic Year *">
              <Input name="academic_year" defaultValue={modalEditSalary.academic_year} required />
            </FormField>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateSalary.isPending} className="flex-1">
                {updateSalary.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setModalEditSalary(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
