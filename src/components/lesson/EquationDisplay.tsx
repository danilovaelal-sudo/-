import './EquationDisplay.css'

export function EquationDisplay({ a, b, showSum = true }: { a: number; b: number; showSum?: boolean }) {
  const answer = a * b
  return (
    <div className="equation">
      {showSum && (
        <div className="equation__sum">
          {Array.from({ length: a }, (_, i) => (
            <span key={i}>
              {b}
              {i < a - 1 ? ' +' : ' ='}
            </span>
          ))}
          <span>{answer}</span>
        </div>
      )}
      <div className="equation__result">
        {a} × {b} = {answer}
      </div>
    </div>
  )
}
