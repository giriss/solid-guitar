interface VolumeSelectorProps {
  value: number // 0 to 1
  onChange: (volume: number) => void
}

export default function VolumeSelector(props: VolumeSelectorProps) {
  return (
    <div class="flex items-center gap-4 w-full">
      <input
        class="range range-primary range-xs flex-1"
        type="range"
        min="0"
        max="100"
        value={Math.round(props.value * 100)}
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value) / 100)}
      />
      <span class="min-w-16 font-bold text-sm text-right">{Math.round(props.value * 100)}%</span>
    </div>
  )
}
