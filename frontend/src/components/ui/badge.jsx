import { cn } from "@/lib/utils"

export function Badge({ className, variant = "info", children, ...props }) {
  const variants = {
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    purple: "badge-purple",
    default: "badge bg-secondary text-foreground border border-border",
  }

  return (
    <span className={cn(variants[variant] || variants.default, className)} {...props}>
      {children}
    </span>
  )
}
