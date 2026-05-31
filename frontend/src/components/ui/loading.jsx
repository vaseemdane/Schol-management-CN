import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }
  return (
    <Loader2 className={`animate-spin text-primary ${sizes[size]} ${className}`} />
  )
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function EmptyState({ title = "No data found", description = "", icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/30" />}
      <h3 className="text-foreground font-medium">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
    </div>
  )
}
