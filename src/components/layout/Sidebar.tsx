import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/auth/permissions'
import { useRole } from '@/auth/RoleContext'
import { cn } from '@/lib/cn'

interface SidebarProps {
  open: boolean
  onNavigate?: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { can } = useRole()
  const items = NAV_ITEMS.filter((item) => can(item.permission))

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white pt-[4.5rem] transition-transform lg:static lg:translate-x-0 lg:pt-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="hidden border-b border-slate-100 px-5 py-5 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
          AccellionX
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          Giyani Workflow Demo
        </h1>
        <p className="mt-1 text-xs text-slate-500">Frontend-first healthcare workflows</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-50 text-accent-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
