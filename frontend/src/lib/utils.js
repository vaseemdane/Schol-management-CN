import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getGradeBadgeClass(grade) {
  if (!grade) return 'badge-info'
  if (['A+', 'A'].includes(grade)) return 'badge-success'
  if (['B+', 'B'].includes(grade)) return 'badge-info'
  if (['C', 'D'].includes(grade)) return 'badge-warning'
  return 'badge-error'
}

export function getAttendanceBadgeClass(status) {
  if (status === 'present') return 'badge-success'
  if (status === 'late') return 'badge-warning'
  return 'badge-error'
}

export function calculatePercentage(obtained, total) {
  if (!total) return 0
  return Math.round((obtained / total) * 100)
}
