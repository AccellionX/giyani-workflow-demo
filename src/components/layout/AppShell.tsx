import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DemoBanner } from './DemoBanner'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/cn'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner />
      <div className="flex min-h-[calc(100vh-2.25rem)]">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        <div className={cn('flex min-w-0 flex-1 flex-col')}>
          <TopBar onMenuClick={() => setMobileOpen((open) => !open)} />
          <main className="flex-1 px-4 py-6 lg:px-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
