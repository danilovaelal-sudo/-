import './Pix.css'

export type PixMood = 'neutral' | 'greeting' | 'thinking' | 'hint' | 'joy' | 'calm'

const MOUTH_PATHS: Record<PixMood, string> = {
  neutral: 'M26 40h12',
  greeting: 'M25 39q7 4 14 0',
  thinking: 'M29 40h6',
  hint: 'M29 40h6',
  joy: 'M23 37q9 9 18 0',
  calm: 'M25 39q7 4 14 0',
}

export function Pix({ mood = 'neutral', size = 72 }: { mood?: PixMood; size?: number }) {
  return (
    <svg
      className={`pix pix--${mood}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Пикс, цифровой помощник (${moodLabel(mood)})`}
    >
      <defs>
        <linearGradient id="pix-body-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2f86ff" />
          <stop offset="100%" stopColor="#0a2e73" />
        </linearGradient>
      </defs>

      <circle className="pix__cell pix__cell--left" cx="20" cy="12" r="6" fill="#eaf3ff" stroke="#146bff" strokeWidth="1.6" />
      <circle className="pix__cell pix__cell--right" cx="44" cy="12" r="6" fill="#eaf3ff" stroke="#146bff" strokeWidth="1.6" />

      <rect className="pix__body" x="12" y="16" width="40" height="34" rx="16" fill="url(#pix-body-gradient)" />

      <circle className="pix__eye" cx="24" cy="30" r="2.6" fill="#eaf3ff" />
      <circle className="pix__eye" cx="40" cy="30" r="2.6" fill="#eaf3ff" />

      <path className="pix__mouth" d={MOUTH_PATHS[mood]} stroke="#eaf3ff" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      <circle className="pix__accent" cx="47" cy="17" r="3.2" fill="#ffd43b" />
    </svg>
  )
}

function moodLabel(mood: PixMood): string {
  switch (mood) {
    case 'greeting': return 'приветствует'
    case 'thinking': return 'размышляет'
    case 'hint': return 'подсказывает'
    case 'joy': return 'радуется'
    case 'calm': return 'спокойно поддерживает'
    default: return 'нейтральный'
  }
}
