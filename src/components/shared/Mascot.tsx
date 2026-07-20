import './Mascot.css'

type Mood = 'happy' | 'excited' | 'sad' | 'thinking'

const FACE_BY_MOOD: Record<Mood, string> = {
  happy: '🦊',
  excited: '🥳',
  sad: '🙈',
  thinking: '🤔',
}

export function Mascot({ mood = 'happy', size = 'normal' }: { mood?: Mood; size?: 'normal' | 'small' }) {
  const classes = ['mascot', `mascot--${mood}`, size === 'small' ? 'mascot--small' : ''].filter(Boolean).join(' ')
  return (
    <span className={classes} role="img" aria-label={`Лисёнок-помощник (${mood})`}>
      {FACE_BY_MOOD[mood]}
    </span>
  )
}
