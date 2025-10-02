import SlideTypeCard from '../SlideTypeCard'
import { BarChart3, Cloud } from 'lucide-react'

export default function SlideTypeCardExample() {
  return (
    <div className="grid gap-3 max-w-xs">
      <SlideTypeCard
        icon={BarChart3}
        title="Multiple Choice"
        description="Poll your audience with multiple options"
        onClick={() => console.log('Multiple Choice clicked')}
      />
      <SlideTypeCard
        icon={Cloud}
        title="Word Cloud"
        description="Collect ideas in a visual cloud"
        onClick={() => console.log('Word Cloud clicked')}
      />
    </div>
  )
}
