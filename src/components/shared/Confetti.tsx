import { useMemo } from 'react'

const COLORS = ['#ff6b6b', '#ffca3a', '#4ecb71', '#4cc9f0', '#6c4ce0', '#ff8fd6']

export function Confetti({ pieces = 24 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.2 + Math.random() * 0.8,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        size: 6 + Math.random() * 6,
      })),
    [pieces],
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 200,
      }}
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${item.left}%`,
            width: item.size,
            height: item.size * 1.4,
            background: item.color,
            borderRadius: 2,
            transform: `rotate(${item.rotate}deg)`,
            animation: `confetti-fall ${item.duration}s ease-in ${item.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
