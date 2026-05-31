import { cn } from "@/lib/utils"

export function Table({ className, children, ...props }) {
  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className={cn("w-full", className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return <thead className={cn("", className)} {...props}>{children}</thead>
}

export function TableBody({ className, children, ...props }) {
  return <tbody className={cn("", className)} {...props}>{children}</tbody>
}

export function TableRow({ className, children, ...props }) {
  return <tr className={cn("table-row", className)} {...props}>{children}</tr>
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn("table-cell table-header font-semibold text-left", className)}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn("table-cell", className)} {...props}>
      {children}
    </td>
  )
}
