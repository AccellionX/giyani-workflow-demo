import { Navigate } from 'react-router-dom'
import type { Permission } from './permissions'
import { useRole } from './RoleContext'

interface RequireRoleProps {
  permission: Permission
  children: React.ReactNode
  fallbackTo?: string
}

export function RequireRole({
  permission,
  children,
  fallbackTo = '/',
}: RequireRoleProps) {
  const { can } = useRole()

  if (!can(permission)) {
    return <Navigate to={fallbackTo} replace />
  }

  return <>{children}</>
}
