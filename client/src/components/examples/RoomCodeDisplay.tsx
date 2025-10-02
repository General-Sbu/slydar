import RoomCodeDisplay from '../RoomCodeDisplay'

export default function RoomCodeDisplayExample() {
  return (
    <div className="max-w-md">
      <RoomCodeDisplay code="ABC123" participantCount={24} />
    </div>
  )
}
