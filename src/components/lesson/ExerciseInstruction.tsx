import './ExerciseInstruction.css'

export function ExerciseInstruction({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="exercise-instruction">
      <p className="exercise-instruction__title">{title}</p>
      {subtitle && <p className="exercise-instruction__subtitle">{subtitle}</p>}
    </div>
  )
}
