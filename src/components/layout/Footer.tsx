import { useEffect, useState } from 'react'
import { getSimulateApiError, setSimulateApiError } from '@/api/client'
import { useQueryClient } from '@tanstack/react-query'

export function Footer() {
  const queryClient = useQueryClient()
  const [simulateError, setSimulateError] = useState(false)

  useEffect(() => {
    setSimulateError(getSimulateApiError())
  }, [])

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          AccellionX · Giyani Workflow Demo · Mock API via MSW
        </p>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(event) => {
              const next = event.target.checked
              setSimulateError(next)
              setSimulateApiError(next)
              void queryClient.invalidateQueries()
            }}
            className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500"
          />
          Simulate API error
        </label>
      </div>
    </footer>
  )
}
