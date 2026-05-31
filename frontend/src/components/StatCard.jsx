import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({ title, value, subtitle, icon: Icon, color = "blue", trend, trendLabel }) {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
  }

  const iconBg = {
    blue: "bg-blue-500/15",
    purple: "bg-purple-500/15",
    green: "bg-green-500/15",
    orange: "bg-orange-500/15",
    red: "bg-red-500/15",
    cyan: "bg-cyan-500/15",
    pink: "bg-pink-500/15",
  }

  return (
    <div className={cn(
      "stat-card bg-gradient-to-br border",
      colors[color] || colors.blue
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", colors[color]?.split(" ")[3])}>{value}</p>
          {subtitle && <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl", iconBg[color] || iconBg.blue)}>
            <Icon className={cn("w-6 h-6", colors[color]?.split(" ")[3])} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-current/10">
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={cn("text-xs font-medium", trend >= 0 ? "text-green-400" : "text-red-400")}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-muted-foreground">{trendLabel || "vs last month"}</span>
        </div>
      )}
    </div>
  )
}
