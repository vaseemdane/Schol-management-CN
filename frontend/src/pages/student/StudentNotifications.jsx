import { useQuery } from "@tanstack/react-query"
import { notificationsApi } from "@/api"
import { LoadingPage, EmptyState } from "@/components/ui/loading"
import { Badge } from "@/components/ui/badge"
import { Bell, Megaphone, CalendarDays, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

const typeConfig = {
  general: { label: "Notice", icon: Megaphone, bg: "bg-blue-500/8 border-blue-500/20", icon_bg: "bg-blue-500/15", icon_color: "text-blue-400", badge: "info" },
  exam: { label: "Exam", icon: CalendarDays, bg: "bg-yellow-500/8 border-yellow-500/20", icon_bg: "bg-yellow-500/15", icon_color: "text-yellow-400", badge: "warning" },
  holiday: { label: "Holiday", icon: Bell, bg: "bg-green-500/8 border-green-500/20", icon_bg: "bg-green-500/15", icon_color: "text-green-400", badge: "success" },
  alert: { label: "Alert", icon: AlertCircle, bg: "bg-red-500/8 border-red-500/20", icon_bg: "bg-red-500/15", icon_color: "text-red-400", badge: "error" },
}

export default function StudentNotifications() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then(r => r.data),
  })

  if (isLoading) return <LoadingPage />

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-subtitle">{notifications.length} notifications from school</p>
        </div>
        <div className="relative">
          <Bell className="w-6 h-6 text-muted-foreground" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll be notified about exams, holidays, and important announcements here." icon={Bell} />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const tc = typeConfig[n.notification_type] || typeConfig.general
            const Icon = tc.icon
            return (
              <div key={n.id} className={`glass-card p-5 border ${tc.bg} flex items-start gap-4 hover:scale-[1.005] transition-transform duration-200`}>
                <div className={`p-3 rounded-xl flex-shrink-0 ${tc.icon_bg}`}>
                  <Icon className={`w-5 h-5 ${tc.icon_color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground">{n.title}</h3>
                    <Badge variant={tc.badge}>{tc.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground/50 mt-2">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
