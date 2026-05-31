import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("input", className)} {...props} />
))
Input.displayName = "Input"

export const Label = ({ className, children, ...props }) => (
  <label className={cn("label", className)} {...props}>{children}</label>
)

export function FormField({ label, error, children, className }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("input min-h-[80px] resize-none", className)}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "input appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
