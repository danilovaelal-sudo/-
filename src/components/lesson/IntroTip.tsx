import './IntroTip.css'

export function IntroTip({ lines, onDismiss }: { lines: string[]; onDismiss: () => void }) {
  return (
    <div className="intro-tip" role="note">
      <div className="intro-tip__lines">
        {lines.map((line, i) => (
          <span className="intro-tip__line" key={i}>{line}</span>
        ))}
      </div>
      <button className="intro-tip__dismiss" onClick={onDismiss}>Понятно</button>
    </div>
  )
}
