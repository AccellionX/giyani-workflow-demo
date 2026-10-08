import type { Role } from '@/api/contracts'
import { useRole } from '@/auth/RoleContext'
import { formatRole } from '@/lib/format'
import { Button } from '@/components/ui'

interface TopBarProps {
  onMenuClick: () => void
}

const ROLES: Role[] = ['admin', 'front_desk', 'clinician']

export function TopBar({ onMenuClick }: TopBarProps) {
  const { role, setRole, displayName } = useRole()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            Menu
          </Button>
          <div className="lg:hidden">
            <p className="text-sm font-semibold text-slate-900">Giyani Workflow Demo</p>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900">
              {displayName} · {formatRole(role)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="role-switcher" className="sr-only">
            Switch role
          </label>
          <select
            id="role-switcher"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
          >
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {formatRole(option)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
