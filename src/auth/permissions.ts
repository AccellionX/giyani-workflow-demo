import type { Role } from '@/api/contracts'

export type Permission =
  | 'view:dashboard'
  | 'view:patients'
  | 'create:intake'
  | 'view:review'
  | 'act:review'
  | 'view:audit'
  | 'view:about'

const ALL_PERMISSIONS: Permission[] = [
  'view:dashboard',
  'view:patients',
  'create:intake',
  'view:review',
  'act:review',
  'view:audit',
  'view:about',
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  front_desk: [
    'view:dashboard',
    'view:patients',
    'create:intake',
    'view:review',
    'view:about',
  ],
  clinician: [
    'view:dashboard',
    'view:patients',
    'view:review',
    'act:review',
    'view:about',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export interface NavItem {
  to: string
  label: string
  permission: Permission
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', permission: 'view:dashboard' },
  { to: '/patients', label: 'Patients', permission: 'view:patients' },
  { to: '/intake', label: 'New Intake', permission: 'create:intake' },
  { to: '/review', label: 'Review Queue', permission: 'view:review' },
  { to: '/audit', label: 'Audit Log', permission: 'view:audit' },
  { to: '/about', label: 'About', permission: 'view:about' },
]
