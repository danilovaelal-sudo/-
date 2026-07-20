import { Fact } from '../../../state/types'

export type SingleExerciseProps = {
  fact: Fact
  disabled?: boolean
  onAnswered: (correct: boolean) => void
}
