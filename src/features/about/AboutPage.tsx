import { Card } from '@/components/ui'

const BULLETS = [
  'Typed contracts in `src/api/contracts.ts` define every request and response shape the UI depends on.',
  'MSW handlers in `src/mocks/` implement those contracts so screens can be built and demoed before a backend exists.',
  'A single permissions map in `src/auth/permissions.ts` plus `<RequireRole>` drives navigation and allowed actions by role.',
  'Reusable primitives live in `src/components/ui` and are composed by feature screens—no one-off form controls.',
  'Feature folders under `src/features/` stay self-contained; swapping to a real API means changing `VITE_API_BASE_URL`.',
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">About this demo</h1>
        <p className="mt-1 text-sm text-slate-500">
          How AccellionX structures a frontend-first healthcare workflow product.
        </p>
      </div>

      <Card title="Architecture in five bullets">
        <ul className="space-y-4">
          {BULLETS.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
