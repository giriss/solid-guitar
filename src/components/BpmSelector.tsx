interface BpmSelectorProps {
  value: number
  onChange: (bpm: number) => void
}

export default function BpmSelector(props: BpmSelectorProps) {
  return (
    <div class="flex items-center gap-4 w-full">
      <input
        class="range range-primary flex-1"
        type="range"
        min="40"
        max="200"
        value={props.value}
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value))}
      />
      <span class="min-w-16 font-bold text-sm text-right">{props.value} BPM</span>
    </div>
  )
}
