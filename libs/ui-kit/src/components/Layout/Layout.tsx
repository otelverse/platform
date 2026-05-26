import type { ReactNode } from 'react'

interface LayoutProps {
  sidebar?: ReactNode
  header?: ReactNode
  children: ReactNode
}

export function Layout({ sidebar, header, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-bg-default text-text-primary">
      {sidebar && (
        <aside className="w-64 border-r border-border-default bg-bg-elevated p-4">
          {sidebar}
        </aside>
      )}
      <div className="flex flex-1 flex-col">
        {header && (
          <header className="border-b border-border-default bg-bg-default px-6 py-3">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
