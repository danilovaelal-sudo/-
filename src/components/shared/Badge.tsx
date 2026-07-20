import './Badge.css'

type Props = {
  icon: string
  title: string
  description: string
  earned: boolean
}

export function BadgeItem({ icon, title, description, earned }: Props) {
  return (
    <div className={`badge-item ${earned ? 'badge-item--earned' : 'badge-item--locked'}`}>
      <span className="badge-item__icon">{icon}</span>
      <span className="badge-item__title">{title}</span>
      <span className="badge-item__desc">{description}</span>
    </div>
  )
}
