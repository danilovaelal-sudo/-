import { ExerciseType, Fact } from '../../state/types'

export function exerciseInstructionFor(exercise: ExerciseType, fact: Fact): { title: string; subtitle?: string } {
  switch (exercise) {
    case 'choice':
      return { title: 'Выбери правильный ответ' }
    case 'fillBlank':
      return { title: 'Какое число пропущено?' }
    case 'input':
      return { title: 'Введи ответ' }
    case 'match':
      return { title: 'Составь пары', subtitle: 'Сначала нажми на пример, потом на его ответ' }
    case 'groups':
      return { title: `Собери ${fact.a} ${groupsWord(fact.a)} по ${fact.b}` }
  }
}

export function groupsWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'группу'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'группы'
  return 'групп'
}

export const INTRO_TIPS: Record<ExerciseType, string[]> = {
  choice: ['Пикс: «Выбери один из четырёх вариантов ответа.»'],
  fillBlank: ['Пикс: «Здесь пропущено число. Найди его по примеру.»'],
  input: ['Пикс: «Введи ответ на клавиатуре и нажми «Проверить».»'],
  groups: ['Пикс: «Нажми «+», пока не соберёшь нужное число групп.»', 'Затем нажми «Готово».'],
  match: ['Пикс: «Нажми на пример, потом на его ответ, чтобы соединить их.»'],
}
