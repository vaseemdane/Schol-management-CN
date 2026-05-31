import { useQuery } from "@tanstack/react-query"
import { studentsApi, attendanceApi, marksApi, feesApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { FileDown, FileText, Calendar, TrendingUp, CreditCard } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

function generateSimplePDF(title, content) {
  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
          .school { text-align: center; color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1a56db; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
          .info { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
          .info-item { flex: 1; min-width: 150px; background: #f0f4ff; padding: 12px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #666; }
          .info-value { font-size: 18px; font-weight: bold; color: #1a56db; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="school">C.N.Mugalkod Schools | Est. 2005 | Excellence in Education</p>
        ${content}
        <div class="footer">Generated on ${new Date().toLocaleDateString("en-IN")} | C.N.Mugalkod Schools ERP System</div>
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => { printWindow.print() }, 500)
}

export default function StudentReports() {
  const { data: profile } = useQuery({ queryKey: ["student-me"], queryFn: () => studentsApi.getMe().then(r => r.data) })

  const { data: attSummary } = useQuery({
    queryKey: ["student-att-summary", profile?.id],
    queryFn: () => attendanceApi.studentSummary(profile.id).then(r => r.data),
    enabled: !!profile?.id,
  })
  const { data: marks = [] } = useQuery({
    queryKey: ["student-marks", profile?.id],
    queryFn: () => marksApi.list({ student_id: profile.id }).then(r => r.data),
    enabled: !!profile?.id,
  })
  const { data: feeData } = useQuery({
    queryKey: ["student-fee", profile?.id],
    queryFn: () => feesApi.getByStudent(profile.id).then(r => r.data),
    enabled: !!profile?.id,
  })

  const downloadAttendance = () => {
    const rows = (attSummary?.monthly || []).map(m =>
      `<tr><td>${m.month}</td><td>${m.present || 0}</td><td>${m.absent || 0}</td><td>${m.late || 0}</td></tr>`
    ).join("")

    generateSimplePDF("Attendance Report", `
      <div class="info">
        <div class="info-item"><div class="info-label">Student</div><div class="info-value">${profile?.name}</div></div>
        <div class="info-item"><div class="info-label">Roll No</div><div class="info-value">${profile?.roll_number}</div></div>
        <div class="info-item"><div class="info-label">Class</div><div class="info-value">${profile?.class_name}</div></div>
        <div class="info-item"><div class="info-label">Attendance %</div><div class="info-value">${attSummary?.percentage || 0}%</div></div>
      </div>
      <table>
        <tr><th>Month</th><th>Present</th><th>Absent</th><th>Late</th></tr>
        ${rows || "<tr><td colspan='4'>No records</td></tr>"}
      </table>
    `)
  }

  const downloadPerformance = () => {
    const rows = marks.map(m =>
      `<tr><td>${m.subject_name}</td><td>${m.exam_name}</td><td>${m.marks_obtained}/${m.total_marks}</td><td>${Math.round((m.marks_obtained / (m.total_marks || 100)) * 100)}%</td><td>${m.grade || "—"}</td></tr>`
    ).join("")

    generateSimplePDF("Performance Report", `
      <div class="info">
        <div class="info-item"><div class="info-label">Student</div><div class="info-value">${profile?.name}</div></div>
        <div class="info-item"><div class="info-label">Roll No</div><div class="info-value">${profile?.roll_number}</div></div>
        <div class="info-item"><div class="info-label">Class</div><div class="info-value">${profile?.class_name}</div></div>
        <div class="info-item"><div class="info-label">Total Exams</div><div class="info-value">${marks.length}</div></div>
      </div>
      <table>
        <tr><th>Subject</th><th>Exam</th><th>Marks</th><th>Percentage</th><th>Grade</th></tr>
        ${rows || "<tr><td colspan='5'>No marks yet</td></tr>"}
      </table>
    `)
  }

  const downloadFees = () => {
    const rows = (feeData?.payments || []).map(p =>
      `<tr><td>${formatDate(p.payment_date)}</td><td>${p.receipt_number}</td><td>${formatCurrency(p.amount)}</td><td>${p.remarks || "—"}</td></tr>`
    ).join("")

    generateSimplePDF("Fee Summary", `
      <div class="info">
        <div class="info-item"><div class="info-label">Student</div><div class="info-value">${profile?.name}</div></div>
        <div class="info-item"><div class="info-label">Total Fee</div><div class="info-value">${formatCurrency(feeData?.total_amount)}</div></div>
        <div class="info-item"><div class="info-label">Paid</div><div class="info-value">${formatCurrency(feeData?.paid_amount)}</div></div>
        <div class="info-item"><div class="info-label">Remaining</div><div class="info-value">${formatCurrency(feeData?.remaining_amount)}</div></div>
      </div>
      <table>
        <tr><th>Date</th><th>Receipt No.</th><th>Amount</th><th>Remarks</th></tr>
        ${rows || "<tr><td colspan='4'>No payments yet</td></tr>"}
      </table>
    `)
  }

  const reports = [
    { title: "Attendance Report", description: "Download your complete attendance history with monthly breakdown.", icon: Calendar, color: "blue", action: downloadAttendance },
    { title: "Performance Report", description: "Download subject-wise marks, grades, and exam results.", icon: TrendingUp, color: "green", action: downloadPerformance },
    { title: "Fee Summary", description: "Download complete fee payment history and receipts.", icon: CreditCard, color: "purple", action: downloadFees },
  ]

  const colorClasses = {
    blue: { bg: "bg-blue-500/10 border-blue-500/20", icon: "text-blue-400 bg-blue-500/15", btn: "from-blue-600 to-blue-500" },
    green: { bg: "bg-green-500/10 border-green-500/20", icon: "text-green-400 bg-green-500/15", btn: "from-green-600 to-emerald-500" },
    purple: { bg: "bg-purple-500/10 border-purple-500/20", icon: "text-purple-400 bg-purple-500/15", btn: "from-purple-600 to-purple-500" },
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Report Downloads</h1>
          <p className="section-subtitle">Download your academic and financial reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map(r => {
          const c = colorClasses[r.color]
          return (
            <div key={r.title} className={`glass-card p-6 border ${c.bg} hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
                <r.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{r.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{r.description}</p>
              <button
                onClick={r.action}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${c.btn} hover:shadow-lg transition-all duration-200`}
              >
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 glass-card p-5 border border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">How to save as PDF</p>
            <p className="text-sm text-muted-foreground mt-1">When the print dialog opens, select "Save as PDF" as the destination to download a PDF file instead of printing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
