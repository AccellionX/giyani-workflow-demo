import { cn } from '@/lib/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
}

export function Select({
  label,
  options,
  error,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
          'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30',
          error ? 'border-rose-400' : 'border-slate-200',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
