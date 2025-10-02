import { useState } from 'react'
import AudienceAnswerButton from '../AudienceAnswerButton'

export default function AudienceAnswerButtonExample() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-3 max-w-lg">
      <AudienceAnswerButton
        label="Strongly Agree"
        selected={selected === 'agree'}
        onClick={() => setSelected('agree')}
      />
      <AudienceAnswerButton
        label="Neutral"
        selected={selected === 'neutral'}
        onClick={() => setSelected('neutral')}
      />
      <AudienceAnswerButton
        label="Disagree"
        selected={selected === 'disagree'}
        onClick={() => setSelected('disagree')}
      />
    </div>
  )
}
