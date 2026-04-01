interface VolumeSelectorProps {
  value: number // 0 to 1
  onChange: (volume: number) => void
}

export default function VolumeSelector(props: VolumeSelectorProps) {
  return (
    <div class="flex items-center gap-4">
      <input
        class="range range-xs"
        type="range"
        min="0"
        max="100"
        value={Math.round(props.value * 100)}
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value) / 100)}
      />
      <span class="min-w-20 font-bold">{Math.round(props.value * 100)}% VOL</span>
    </div>
  )
}
