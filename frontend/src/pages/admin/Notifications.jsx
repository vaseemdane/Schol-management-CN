import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@/api"
import { Button } from "@/components/ui/button"
import { Input, Textarea, FormField, Select } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Bell, Plus, Trash2, Megaphone, CalendarDays, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

const typeConfig = {
  general: { label: "Notice", icon: Megaphone, variant: "info" },
  exam: { label: "Exam", icon: CalendarDays, variant: "warning" },
  holiday: { label: "Holiday", icon: Bell, variant: "success" },
  alert: { label: "Alert", icon: AlertCircle, variant: "error" },
}

export default function Notifications() {
  const qc = useQueryClient()
  const [modalAdd, setModalAdd] = useState(false)

  const { data: notifications = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => notificationsApi.list().then(r => r.data) })
  const create = useMutation({ mutationFn: notificationsApi.create, onSuccess: () => { qc.invalidateQueries(["notifications"]); setModalAdd(false) } })
  const remove = useMutation({ mutationFn: notificationsApi.delete, onSuccess: () => qc.invalidateQueries(["notifications"]) })

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-subtitle">{notifications.length} active notifications</p>
        </div>
        <Button onClick={() => setModalAdd(true)}><Plus className="w-4 h-4 mr-1" />New Notification</Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && <EmptyState title="No notifications" icon={Bell} description="Create notifications to inform students and teachers." />}
        {notifications.map(n => {
          const tc = typeConfig[n.notification_type] || typeConfig.general
          const Icon = tc.icon
          return (
            <div key={n.id} className="glass-card p-5 flex items-start gap-4 group hover:border-border/80 transition-colors">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                n.notification_type === "exam" ? "bg-yellow-500/15" :
                n.notification_type === "holiday" ? "bg-green-500/15" :
                n.notification_type === "alert" ? "bg-red-500/15" : "bg-blue-500/15"
              }`}>
                <Icon className={`w-5 h-5 ${
                  n.notification_type === "exam" ? "text-yellow-400" :
                  n.notification_type === "holiday" ? "text-green-400" :
                  n.notification_type === "alert" ? "text-red-400" : "text-blue-400"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm">{n.title}</h3>
                  <Badge variant={tc.variant}>{tc.label}</Badge>
                  {n.target_role && <Badge variant="default">For {n.target_role}s</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">{formatDateTime(n.created_at)}</p>
              </div>
              <button
                onClick={() => remove.mutate(n.id)}
                className="btn-icon text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Create Notification">
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); create.mutate({ title: fd.get("title"), message: fd.get("message"), target_role: fd.get("target_role") || null, notification_type: fd.get("notification_type") }) }} className="space-y-4">
          <FormField label="Title *">
            <Input name="title" placeholder="Notification title" required />
          </FormField>
          <FormField label="Message *">
            <Textarea name="message" placeholder="Write your notification message..." required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <Select name="notification_type" defaultValue="general">
                {Object.entries(typeConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Target Role">
              <Select name="target_role">
                <option value="">All (Everyone)</option>
                <option value="student">Students only</option>
                <option value="teacher">Teachers only</option>
              </Select>
            </FormField>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending} className="flex-1">{create.isPending ? "Sending..." : "Send Notification"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalAdd(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
