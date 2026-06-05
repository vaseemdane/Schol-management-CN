import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { certificatesApi, studentsApi } from "@/api"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Award, Plus, Printer, Download, Edit2, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const certTypes = [
  { value: "bonafide", label: "Bonafide Certificate" },
  { value: "study", label: "Study Certificate" },
  { value: "transfer", label: "Transfer Certificate" },
]

function CertificatePreview({ cert, student }) {
  if (!cert) return null
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <div id="cert-preview" className="bg-white text-gray-900 p-12 rounded-lg border-8 border-double border-yellow-600 max-w-2xl mx-auto font-serif">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-3xl font-bold">C</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">C.N.Mugalkod Schools</h1>
        <p className="text-sm text-gray-500 mt-1">Affiliated to CBSE | Est. 2005 | Excellence in Education</p>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-3" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-center text-blue-700 uppercase tracking-widest mb-8">
        {certTypes.find(c => c.value === cert.certificate_type)?.label}
      </h2>

      {/* Content */}
      <div className="text-base leading-8 text-gray-700 mb-8 text-justify">
        <p>{cert.content}</p>
      </div>

      {/* Date */}
      <div className="flex justify-between items-end mt-12">
        <div className="text-center">
          <div className="h-0.5 bg-gray-400 w-40 mb-1" />
          <p className="text-xs text-gray-500">Date: {today}</p>
        </div>
        <div className="text-center">
          <div className="h-0.5 bg-gray-400 w-40 mb-1" />
          <p className="text-xs text-gray-500">Principal's Signature</p>
          <p className="text-xs text-gray-400">C.N.Mugalkod Schools</p>
        </div>
      </div>
    </div>
  )
}

export default function CertificateGenerator() {
  const qc = useQueryClient()
  const [modalGen, setModalGen] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [previewCert, setPreviewCert] = useState(null)

  const { data: certificates = [], isLoading } = useQuery({ queryKey: ["certificates"], queryFn: () => certificatesApi.list().then(r => r.data) })
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => studentsApi.list().then(r => r.data) })

  const generate = useMutation({
    mutationFn: certificatesApi.generate,
    onSuccess: (res) => {
      qc.invalidateQueries(["certificates"])
      setModalGen(false)
      setPreviewCert(res.data)
    },
  })

  const updateCert = useMutation({
    mutationFn: ({ id, data }) => certificatesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["certificates"])
      setModalEdit(null)
      setPreviewCert(null)
    },
  })

  const deleteCert = useMutation({
    mutationFn: certificatesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries(["certificates"])
      setPreviewCert(null)
    },
  })

  const handlePrint = () => window.print()

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Certificate Generator</h1>
          <p className="section-subtitle">Generate and download certificates for students</p>
        </div>
        <Button onClick={() => setModalGen(true)}><Plus className="w-4 h-4 mr-1" />Generate Certificate</Button>
      </div>

      {/* Certificate types info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {certTypes.map(ct => (
          <div key={ct.value} className="glass-card p-5 text-center border-2 border-border/30 hover:border-yellow-500/30 transition-colors cursor-default">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">{ct.label}</p>
          </div>
        ))}
      </div>

      {/* Preview */}
      {previewCert && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Certificate Preview</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint} className="gap-1"><Printer className="w-4 h-4" />Print</Button>
              <button onClick={() => setPreviewCert(null)} className="btn-ghost btn-sm">Close Preview</button>
            </div>
          </div>
          <CertificatePreview cert={previewCert} />
        </div>
      )}

      {/* History */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Certificate Type</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.length === 0 && (
            <TableRow><td colSpan={4} className="py-12"><EmptyState title="No certificates generated yet" icon={Award} /></td></TableRow>
          )}
          {certificates.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-foreground">{c.student_name}</TableCell>
              <TableCell><Badge variant="warning">{certTypes.find(ct => ct.value === c.certificate_type)?.label || c.certificate_type}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{formatDate(c.issued_date)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreviewCert(c)} className="btn btn-secondary btn-sm gap-1">
                    <Printer className="w-3 h-3" /> Preview
                  </button>
                  <button onClick={() => setModalEdit(c)} className="btn-icon p-1.5 hover:bg-secondary rounded" title="Edit Certificate">
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this certificate?")) {
                        deleteCert.mutate(c.id)
                      }
                    }} 
                    disabled={deleteCert.isPending}
                    className="btn-icon p-1.5 hover:bg-red-500/10 rounded" 
                    title="Delete Certificate"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Generate modal */}
      <Modal isOpen={modalGen} onClose={() => setModalGen(false)} title="Generate Certificate">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); generate.mutate({ student_id: +fd.get("student_id"), certificate_type: fd.get("certificate_type") }) }} className="space-y-4">
          <FormField label="Student *">
            <Select name="student_id" required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </Select>
          </FormField>
          <FormField label="Certificate Type *">
            <Select name="certificate_type" required>
              <option value="">Select Type</option>
              {certTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" disabled={generate.isPending} className="flex-1">{generate.isPending ? "Generating..." : "Generate Certificate"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalGen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Certificate modal */}
      <Modal isOpen={!!modalEdit} onClose={() => setModalEdit(null)} title={`Edit Certificate — ${modalEdit?.student_name}`}>
        {modalEdit && (
          <form onSubmit={e => {
            e.preventDefault()
            const fd = new FormData(e.target)
            updateCert.mutate({
              id: modalEdit.id,
              data: {
                content: fd.get("content")
              }
            })
          }} className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Student</span>
                <span className="font-semibold text-foreground">{modalEdit.student_name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-yellow-400">{certTypes.find(ct => ct.value === modalEdit.certificate_type)?.label || modalEdit.certificate_type}</span>
              </div>
            </div>
            <FormField label="Certificate Content *">
              <textarea
                name="content"
                defaultValue={modalEdit.content}
                className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                rows={6}
                required
              />
            </FormField>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateCert.isPending} className="flex-1">
                {updateCert.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setModalEdit(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
