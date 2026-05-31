import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { feesApi, studentsApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

export default function FeeManagement() {
  const qc = useQueryClient()
  const [modalFee, setModalFee] = useState(false)
  const [modalPay, setModalPay] = useState(null)
  const [selectedFee, setSelectedFee] = useState(null)

  const { data: fees = [], isLoading } = useQuery({ queryKey: ["fees"], queryFn: () => feesApi.list().then(r => r.data) })
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })

  const createFee = useMutation({ mutationFn: feesApi.create, onSuccess: () => { qc.invalidateQueries(["fees"]); setModalFee(false) } })
  const addPayment = useMutation({ mutationFn: feesApi.addPayment, onSuccess: () => { qc.invalidateQueries(["fees"]); setModalPay(null) } })

  const totalFees = fees.reduce((s, f) => s + f.total_amount, 0)
  const totalPaid = fees.reduce((s, f) => s + f.paid_amount, 0)
  const totalPending = fees.reduce((s, f) => s + f.remaining_amount, 0)

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Fee Management</h1>
          <p className="section-subtitle">Track and manage student fee payments</p>
        </div>
        <Button onClick={() => setModalFee(true)}><Plus className="w-4 h-4 mr-1" />Add Fee Record</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground uppercase">Total Fees</p><p className="text-2xl font-bold text-blue-400">{formatCurrency(totalFees)}</p></div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-green-500/15 to-green-600/5 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground uppercase">Collected</p><p className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</p></div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-red-500/15 to-red-600/5 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground uppercase">Pending</p><p className="text-2xl font-bold text-red-400">{formatCurrency(totalPending)}</p></div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Fee table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Total Fee</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees.length === 0 && (
            <TableRow><td colSpan={6} className="py-12"><EmptyState title="No fee records" icon={CreditCard} /></td></TableRow>
          )}
          {fees.map(f => (
            <TableRow key={f.id}>
              <TableCell className="font-medium text-foreground">{f.student_name || `Student #${f.student_id}`}</TableCell>
              <TableCell>{formatCurrency(f.total_amount)}</TableCell>
              <TableCell className="text-green-400 font-semibold">{formatCurrency(f.paid_amount)}</TableCell>
              <TableCell className={f.remaining_amount > 0 ? "text-red-400 font-semibold" : "text-muted-foreground"}>{formatCurrency(f.remaining_amount)}</TableCell>
              <TableCell>
                {f.remaining_amount <= 0 ? (
                  <Badge variant="success">Paid</Badge>
                ) : f.paid_amount > 0 ? (
                  <Badge variant="warning">Partial</Badge>
                ) : (
                  <Badge variant="error">Unpaid</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedFee(f); setModalPay(f) }} className="btn btn-secondary btn-sm">
                    <Plus className="w-3 h-3" /> Payment
                  </button>
                  <button onClick={() => setSelectedFee(f)} className="btn btn-ghost btn-sm">History</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payment history */}
      {selectedFee && !modalPay && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment History — {selectedFee.student_name}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFee.payments?.length === 0 && <p className="text-muted-foreground text-sm">No payments yet.</p>}
            <div className="space-y-2">
              {selectedFee.payments?.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">Receipt: {p.receipt_number}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(p.payment_date)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add fee record modal */}
      <Modal isOpen={modalFee} onClose={() => setModalFee(false)} title="Add Fee Record">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); createFee.mutate({ student_id: +fd.get("student_id"), total_amount: +fd.get("total_amount"), academic_year: fd.get("academic_year") }) }} className="space-y-4">
          <FormField label="Student *">
            <Select name="student_id" required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </Select>
          </FormField>
          <FormField label="Total Fee Amount (₹) *">
            <Input name="total_amount" type="number" placeholder="e.g. 7000" required />
          </FormField>
          <FormField label="Academic Year">
            <Input name="academic_year" defaultValue="2024-25" required />
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={createFee.isPending} className="flex-1">{createFee.isPending ? "Adding..." : "Add Fee Record"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalFee(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Add payment modal */}
      <Modal isOpen={!!modalPay} onClose={() => setModalPay(null)} title={`Add Payment — ${modalPay?.student_name}`}>
        {modalPay && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Fee</span>
                <span className="font-semibold text-foreground">{formatCurrency(modalPay.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-semibold text-green-400">{formatCurrency(modalPay.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-bold text-red-400">{formatCurrency(modalPay.remaining_amount)}</span>
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addPayment.mutate({ fee_id: modalPay.id, amount: +fd.get("amount"), remarks: fd.get("remarks") }) }} className="space-y-4">
              <FormField label="Payment Amount (₹) *">
                <Input name="amount" type="number" max={modalPay.remaining_amount} placeholder={`Max: ₹${modalPay.remaining_amount}`} required />
              </FormField>
              <FormField label="Remarks">
                <Input name="remarks" placeholder="e.g. Cash payment, term 1" />
              </FormField>
              <div className="flex gap-3">
                <Button type="submit" disabled={addPayment.isPending} className="flex-1">{addPayment.isPending ? "Processing..." : "Add Payment"}</Button>
                <Button type="button" variant="secondary" onClick={() => setModalPay(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
