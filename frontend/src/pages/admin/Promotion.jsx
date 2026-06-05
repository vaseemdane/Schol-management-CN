import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { promotionApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input, FormField } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { formatDate } from "@/lib/utils"
import { GraduationCap, History, AlertCircle, Calendar, Eye, HelpCircle } from "lucide-react"

export default function Promotion() {
  const qc = useQueryClient()
  const [confirmModal, setConfirmModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)

  const [fromYear, setFromYear] = useState("2026-27")
  const [toYear, setToYear] = useState("2027-28")
  const [finalClasses, setFinalClasses] = useState("Class 10")

  // Queries
  const { data: logs = [], isLoading: loadLogs } = useQuery({
    queryKey: ["promotion-history"],
    queryFn: () => promotionApi.history().then(r => r.data)
  })

  const { data: detailData, isLoading: loadDetail } = useQuery({
    queryKey: ["promotion-detail", detailModal],
    queryFn: () => promotionApi.historyDetail(detailModal).then(r => r.data),
    enabled: !!detailModal
  })

  // Mutations
  const promoteMutation = useMutation({
    mutationFn: promotionApi.promote,
    onSuccess: () => {
      qc.invalidateQueries(["promotion-history"])
      setConfirmModal(false)
      alert("Promotion completed successfully!")
    },
    onError: (err) => {
      setConfirmModal(false)
      const msg = err.response?.data?.detail || "Failed to execute promotion."
      alert(msg)
    }
  })

  const handlePromoteSubmit = (e) => {
    e.preventDefault()
    setConfirmModal(true)
  }

  const executePromotion = () => {
    promoteMutation.mutate({
      from_academic_year: fromYear,
      to_academic_year: toYear,
      final_class_names: finalClasses.split(",").map(c => c.trim()).filter(Boolean)
    })
  }

  if (loadLogs) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Academic Year Promotion</h1>
          <p className="section-subtitle">Promote students to their next classes for the new academic year</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Promotion Form */}
        <Card className="lg:col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <GraduationCap className="w-5 h-5 text-primary" />
              Promote Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <FormField label="From Academic Year *">
                <Input value={fromYear} onChange={e => setFromYear(e.target.value)} placeholder="e.g. 2026-27" required />
              </FormField>
              <FormField label="To Academic Year *">
                <Input value={toYear} onChange={e => setToYear(e.target.value)} placeholder="e.g. 2027-28" required />
              </FormField>
              <FormField label="Graduating/Final Classes *">
                <Input 
                  value={finalClasses} 
                  onChange={e => setFinalClasses(e.target.value)} 
                  placeholder="e.g. Class 10 (comma separated)" 
                  required 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students in these classes will be marked as "Passed Out" instead of promoted.
                </p>
              </FormField>

              <Button type="submit" className="w-full mt-4" disabled={promoteMutation.isPending}>
                <GraduationCap className="w-4 h-4 mr-1" />
                Initiate Promotion
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Safety / Info Notice Card */}
        <Card className="lg:col-span-2 border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              Important Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Before promoting students to the new academic year <strong>{toYear || "2027-28"}</strong>, make sure you have done the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Create Target Classes:</strong> Ensure classes for the next level exist in the system (e.g. if students are in "Class 1 A" English, "Class 2 A" English must exist with the same section and medium).
              </li>
              <li>
                <strong>Graduating Classes:</strong> Double check that final classes are accurately named so graduating students are correctly moved to "Passed Out" status.
              </li>
              <li>
                <strong>Data Retention:</strong> Historical student class data, attendance records, marks, and fee payment histories from the previous years are stored and remain completely safe.
              </li>
              <li>
                <strong>Irreversible Action:</strong> This action changes active student current enrollment classes. Please review options carefully before starting.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Promotion Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Promotion Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>From Year</TableHead>
                <TableHead>To Year</TableHead>
                <TableHead>Promoted</TableHead>
                <TableHead>Passed Out</TableHead>
                <TableHead>Executed By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <td colSpan={7} className="py-12">
                    <EmptyState title="No promotion records" icon={History} />
                  </td>
                </TableRow>
              )}
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-foreground">{formatDate(log.created_at)}</TableCell>
                  <TableCell>{log.from_academic_year}</TableCell>
                  <TableCell>{log.to_academic_year}</TableCell>
                  <TableCell className="text-green-400 font-semibold">{log.promoted_count}</TableCell>
                  <TableCell className="text-blue-400 font-semibold">{log.passed_out_count}</TableCell>
                  <TableCell className="text-muted-foreground">{log.promoted_by_name || "Admin"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDetailModal(log.id)}>
                      <Eye className="w-4 h-4 mr-1" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Student Promotion">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
            <p className="font-semibold mb-1">⚠️ Warning: Irreversible Action</p>
            <p>You are about to promote all active students from academic year <strong>{fromYear}</strong> to <strong>{toYear}</strong>.</p>
            <p className="mt-2">Students in final classes <strong>({finalClasses})</strong> will graduate and be marked as Passed Out.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={executePromotion} className="flex-1 bg-red-600 hover:bg-red-700" disabled={promoteMutation.isPending}>
              {promoteMutation.isPending ? "Executing Promotion..." : "Yes, Promote All"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Promotion Log Detail — Run #${detailModal}`}>
        {loadDetail ? (
          <div className="py-12 text-center text-muted-foreground">Loading details...</div>
        ) : detailData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50 text-sm">
              <div>
                <span className="text-muted-foreground block">Academic Year Shift</span>
                <span className="font-semibold text-foreground">{detailData.from_academic_year} ➔ {detailData.to_academic_year}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Promotion Time</span>
                <span className="font-semibold text-foreground">{formatDate(detailData.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Promoted Students</span>
                <span className="font-semibold text-green-400">{detailData.promoted_count} students</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Graduated / Passed Out</span>
                <span className="font-semibold text-blue-400">{detailData.passed_out_count} students</span>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-foreground">Detailed Shift Log</h3>
            <div className="max-h-60 overflow-y-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>From Class</TableHead>
                    <TableHead>To Class</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailData.histories?.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium text-foreground">{h.student_name}</TableCell>
                      <TableCell>{h.from_class_name}</TableCell>
                      <TableCell>{h.to_class_name || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>
                        <Badge variant={h.status === "promoted" ? "success" : "info"}>
                          {h.status === "promoted" ? "Promoted" : "Passed Out"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!detailData.histories || detailData.histories.length === 0) && (
                    <TableRow>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">No students logged in this promotion run.</td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setDetailModal(null)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
