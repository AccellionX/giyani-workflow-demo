import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { RoleProvider } from './RoleContext'
import { RequireRole } from './RequireRole'
import { setStoredRole } from '@/api/client'

function renderWithRole(role: 'admin' | 'front_desk' | 'clinician') {
  setStoredRole(role)
  return render(
    <RoleProvider>
      <MemoryRouter initialEntries={['/audit']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/audit"
            element={
              <RequireRole permission="view:audit">
                <div>Audit Secret</div>
              </RequireRole>
            }
          />
        </Routes>
      </MemoryRouter>
    </RoleProvider>,
  )
}

describe('RequireRole guard', () => {
  it('allows Admin to view audit', () => {
    renderWithRole('admin')
    expect(screen.getByText('Audit Secret')).toBeInTheDocument()
  })

  it('redirects Front Desk away from audit', () => {
    renderWithRole('front_desk')
    expect(screen.queryByText('Audit Secret')).not.toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
