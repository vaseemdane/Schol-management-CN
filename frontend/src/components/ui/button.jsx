import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export const Button = forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    destructive: "btn-destructive",
    ghost: "btn-ghost",
    outline: "btn bg-transparent border border-border hover:bg-secondary text-foreground px-4 py-2.5 text-sm",
  }

  const sizes = {
    default: "",
    sm: "btn-sm",
    lg: "btn-lg",
    icon: "p-2 h-9 w-9",
  }

  return (
    <button
      ref={ref}
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"
