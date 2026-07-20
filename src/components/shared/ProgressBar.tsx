type Props = {
  value: number
  max: number
  color?: string
}

export function ProgressBar({ value, max, color = 'var(--color-green)' }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      style={{
        width: '100%',
        height: 14,
        borderRadius: 999,
        background: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  )
}
