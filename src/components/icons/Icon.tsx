import { SVGProps } from 'react'

export type IconName =
  | 'today'
  | 'learn'
  | 'practice'
  | 'progress'
  | 'soundOn'
  | 'soundOff'
  | 'back'
  | 'settings'
  | 'hint'
  | 'repeat'
  | 'correct'
  | 'review'
  | 'close'
  | 'backspace'
  | 'check'
  | 'chevronRight'
  | 'lock'
  | 'plus'
  | 'flame'
  | 'clock'

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number }

function Base({ size = 24, children, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

const PATHS: Record<IconName, (props: SVGProps<SVGSVGElement> & { size?: number }) => JSX.Element> = {
  today: (p) => (
    <Base {...p}>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" opacity={0.4} />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" opacity={0.4} />
    </Base>
  ),
  learn: (p) => (
    <Base {...p}>
      <rect x="4.5" y="7" width="11" height="14" rx="2.2" />
      <rect x="8.5" y="3" width="11" height="14" rx="2.2" fill="none" />
    </Base>
  ),
  practice: (p) => (
    <Base {...p}>
      <path d="M4 12a8 8 0 0 1 13.3-6" />
      <path d="M20 12a8 8 0 0 1-13.3 6" />
      <path d="M16.5 4.5 17.3 6.5 15.2 6.9" fill="currentColor" stroke="none" />
      <path d="M7.5 19.5 6.7 17.5 8.8 17.1" fill="currentColor" stroke="none" />
    </Base>
  ),
  progress: (p) => (
    <Base {...p}>
      <path d="M4 20V13" />
      <path d="M11 20V8" />
      <path d="M18 20V4" />
    </Base>
  ),
  soundOn: (p) => (
    <Base {...p}>
      <path d="M4 10v4h3.5L13 18V6L7.5 10H4Z" />
      <path d="M16.2 9.2a4 4 0 0 1 0 5.6" />
      <path d="M18.6 6.8a7.6 7.6 0 0 1 0 10.4" />
    </Base>
  ),
  soundOff: (p) => (
    <Base {...p}>
      <path d="M4 10v4h3.5L13 18V6L7.5 10H4Z" />
      <path d="M16 9.5 20 13.5" />
      <path d="M20 9.5 16 13.5" />
    </Base>
  ),
  back: (p) => (
    <Base {...p}>
      <path d="M15 5 8 12l7 7" />
    </Base>
  ),
  settings: (p) => (
    <Base {...p}>
      <path d="M4 7h11" />
      <path d="M18.5 7h1.5" />
      <circle cx="15" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <path d="M4 17h1.5" />
      <path d="M9 17h11" />
      <circle cx="7" cy="17" r="2.2" fill="currentColor" stroke="none" />
    </Base>
  ),
  hint: (p) => (
    <Base {...p}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.2 11.1c.5.3.7.7.7 1.2V16h5v-.7c0-.5.2-.9.7-1.2A6 6 0 0 0 12 3Z" />
    </Base>
  ),
  repeat: (p) => (
    <Base {...p}>
      <path d="M4 12a8 8 0 0 1 14.5-4.6" />
      <path d="M20 5v4h-4" />
      <path d="M20 12a8 8 0 0 1-14.5 4.6" />
      <path d="M4 19v-4h4" />
    </Base>
  ),
  correct: (p) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </Base>
  ),
  review: (p) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.3l3 1.7" />
    </Base>
  ),
  close: (p) => (
    <Base {...p}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Base>
  ),
  backspace: (p) => (
    <Base {...p}>
      <path d="M9 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" />
      <path d="m11 10 4 4" />
      <path d="m15 10-4 4" />
    </Base>
  ),
  check: (p) => (
    <Base {...p}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Base>
  ),
  chevronRight: (p) => (
    <Base {...p}>
      <path d="m9 5 7 7-7 7" />
    </Base>
  ),
  lock: (p) => (
    <Base {...p}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.4" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Base>
  ),
  plus: (p) => (
    <Base {...p}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Base>
  ),
  flame: (p) => (
    <Base {...p}>
      <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 1.5 2.4 1.5 3.5A4.5 4.5 0 0 1 12 19a5.5 5.5 0 0 1-5.5-5.5C6.5 9 9 7 12 3Z" />
    </Base>
  ),
  clock: (p) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Base>
  ),
}

export function Icon({ name, size = 24, ...rest }: Props) {
  const Render = PATHS[name]
  return <Render size={size} {...rest} />
}
