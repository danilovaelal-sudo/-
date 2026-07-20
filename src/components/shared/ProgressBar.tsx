type Props = {
  value: number
  max: number
  color?: string
  label?: string
}

export function ProgressBar({ value, max, color = 'var(--color-blue)', label }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      style={{ width: '100%', height: 10, borderRadius: 999, background: 'var(--color-border)', overflow: 'hidden' }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width var(--transition-normal)',
        }}
      />
    </div>
  )
}
