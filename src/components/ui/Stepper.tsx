import { cn } from '@/lib/cn'

export interface StepItem {
  id: string
  label: string
}

interface StepperProps {
  steps: StepItem[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, index) => {
        const complete = index < currentStep
        const active = index === currentStep
        return (
          <li key={step.id} className="flex items-center sm:flex-1">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  complete && 'bg-accent-600 text-white',
                  active && 'bg-accent-100 text-accent-800 ring-2 ring-accent-500',
                  !complete && !active && 'bg-slate-100 text-slate-500',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {complete ? '✓' : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active || complete ? 'text-slate-900' : 'text-slate-500',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  'mx-3 hidden h-px flex-1 sm:block',
                  complete ? 'bg-accent-400' : 'bg-slate-200',
                )}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
