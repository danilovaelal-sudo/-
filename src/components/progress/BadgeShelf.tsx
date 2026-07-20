import { BADGES } from '../../engine/mastery'
import { BadgeItem } from '../shared/Badge'

export function BadgeShelf({ earnedIds }: { earnedIds: string[] }) {
  return (
    <div className="badge-shelf">
      {BADGES.map((badge) => (
        <BadgeItem
          key={badge.id}
          icon={badge.icon}
          title={badge.title}
          description={badge.description}
          earned={earnedIds.includes(badge.id)}
        />
      ))}
    </div>
  )
}
