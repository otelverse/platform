import { useState, type ReactNode } from 'react'

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
}

export function Table<T extends Record<string, unknown>>({ columns, data, className = '' }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = String(a[sortKey] ?? '')
    const bv = String(b[sortKey] ?? '')
    const cmp = av.localeCompare(bv)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className={`overflow-x-auto rounded border border-border-default ${className}`}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-default bg-bg-elevated">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2 font-medium text-text-secondary ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (sortDir === 'asc' ? ' \u25B2' : ' \u25BC')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-border-default last:border-0 hover:bg-bg-elevated">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-text-primary">
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
