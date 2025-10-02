import PresentationCard from '../PresentationCard'

export default function PresentationCardExample() {
  return (
    <div className="grid gap-4 max-w-sm">
      <PresentationCard
        id="1"
        title="Product Launch Q4"
        slideCount={12}
        participantCount={45}
        lastEdited="2 hours ago"
        isLive={true}
      />
      <PresentationCard
        id="2"
        title="Team Feedback Survey"
        slideCount={8}
        lastEdited="Yesterday"
      />
    </div>
  )
}
