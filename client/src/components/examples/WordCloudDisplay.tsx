import WordCloudDisplay from '../WordCloudDisplay'

export default function WordCloudDisplayExample() {
  const mockWords = [
    { text: "Innovation", count: 12 },
    { text: "Collaboration", count: 8 },
    { text: "Growth", count: 15 },
    { text: "Success", count: 6 },
    { text: "Team", count: 10 },
    { text: "Quality", count: 7 },
    { text: "Excellence", count: 9 },
    { text: "Impact", count: 5 },
  ]

  return (
    <div className="max-w-2xl">
      <WordCloudDisplay words={mockWords} />
    </div>
  )
}
