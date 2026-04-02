interface CapoSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function CapoSelector(props: CapoSelectorProps) {
  return (
    <div class="flex items-center gap-4 w-full">
      <input
        type="range"
        min="0"
        max="11"
        step="1"
        value={props.value}
        class="range range-primary flex-1"
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value))}
      />
      <span class="min-w-20 font-bold text-sm text-right">
        {props.value === 0 ? "No Capo" : `Fret ${props.value}`}
      </span>
    </div>
  )
}
