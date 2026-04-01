interface BpmSelectorProps {
  value: number
  onChange: (bpm: number) => void
}

export default function BpmSelector(props: BpmSelectorProps) {
  return (
    <div class="flex items-center gap-4">
      <input
        class="range"
        type="range"
        min="40"
        max="200"
        value={props.value}
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value))}
      />
      <span class="min-w-20 font-bold">{props.value} BPM</span>
    </div>
  )
}
