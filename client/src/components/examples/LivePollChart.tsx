import LivePollChart from '../LivePollChart'

export default function LivePollChartExample() {
  const mockOptions = [
    { label: "Strongly Agree", votes: 45, percentage: 45, color: "hsl(var(--chart-1))" },
    { label: "Agree", votes: 30, percentage: 30, color: "hsl(var(--chart-2))" },
    { label: "Neutral", votes: 15, percentage: 15, color: "hsl(var(--chart-3))" },
    { label: "Disagree", votes: 10, percentage: 10, color: "hsl(var(--chart-4))" },
  ]

  return (
    <div className="max-w-2xl">
      <LivePollChart
        question="How satisfied are you with our product?"
        options={mockOptions}
        totalVotes={100}
      />
    </div>
  )
}
