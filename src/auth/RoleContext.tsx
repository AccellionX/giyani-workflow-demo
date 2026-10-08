import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role } from '@/api/contracts'
import { getStoredRole, setStoredRole } from '@/api/client'
import { hasPermission, type Permission } from './permissions'

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  can: (permission: Permission) => boolean
  displayName: string
}

const RoleContext = createContext<RoleContextValue | null>(null)

const ROLE_DISPLAY: Record<Role, string> = {
  admin: 'Alex Rivera',
  front_desk: 'Jordan Lee',
  clinician: 'Dr. Sam Okonkwo',
}

function isRole(value: string): value is Role {
  return value === 'admin' || value === 'front_desk' || value === 'clinician'
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const stored = getStoredRole()
    return isRole(stored) ? stored : 'admin'
  })

  const setRole = useCallback((next: Role) => {
    setStoredRole(next)
    setRoleState(next)
  }, [])

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      can: (permission: Permission) => hasPermission(role, permission),
      displayName: ROLE_DISPLAY[role],
    }),
    [role, setRole],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return ctx
}
