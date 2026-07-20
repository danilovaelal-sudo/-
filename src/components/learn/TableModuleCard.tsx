import { CircularProgress } from '../shared/CircularProgress'
import { Icon } from '../icons/Icon'
import { confidentCount, hasReviewFacts, introducedCount, tableModuleStatus } from '../../engine/exampleProgress'
import { Progress, TableModuleStatus, TableNumber } from '../../state/types'
import './TableModuleCard.css'

const STATUS_LABEL: Record<TableModuleStatus, string> = {
  locked: 'Пока закрыто',
  available: 'Можно начинать',
  in_progress: 'Изучается',
  mastered: 'Освоено',
}

const STATUS_COLOR: Record<TableModuleStatus, string> = {
  locked: 'var(--color-border)',
  available: 'var(--color-blue)',
  in_progress: 'var(--color-blue)',
  mastered: 'var(--color-yellow-dark)',
}

export function TableModuleCard({
  tableNumber,
  progress,
  onSelect,
}: {
  tableNumber: TableNumber
  progress: Progress
  onSelect: (table: TableNumber) => void
}) {
  const status = tableModuleStatus(progress, tableNumber)
  const confident = confidentCount(progress, tableNumber)
  const introduced = introducedCount(progress, tableNumber)
  const needsReview = status !== 'locked' && hasReviewFacts(progress, tableNumber)
  const locked = status === 'locked'

  return (
    <button
      className="card table-card"
      disabled={locked}
      onClick={() => onSelect(tableNumber)}
      aria-label={`Таблица на ${tableNumber}. ${STATUS_LABEL[status]}. Познакомился ${introduced} из 10, уверенно знает ${confident} из 10.`}
    >
      <CircularProgress value={confident} max={10} size={56} strokeWidth={6} color={STATUS_COLOR[status]} label="">
        {locked ? <Icon name="lock" size={18} className="table-card__lock" /> : <span className="table-card__number">×{tableNumber}</span>}
      </CircularProgress>
      <div className="grow">
        <div className="table-card__number">Таблица на {tableNumber}</div>
        <div
          className={
            'table-card__status' +
            (needsReview ? ' table-card__status--review' : status === 'mastered' ? ' table-card__status--mastered' : '')
          }
        >
          {needsReview ? 'Стоит повторить' : STATUS_LABEL[status]}
          {!locked && ` · ${introduced} изучается, ${confident} уверенно`}
        </div>
      </div>
      {!locked && <Icon name="chevronRight" size={20} className="table-card__lock" />}
    </button>
  )
}
