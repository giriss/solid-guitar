const VOL_OPTIONS: { label: string; value: number }[] = [
  { label: "33%", value: 0.33 },
  { label: "66%", value: 0.66 },
  { label: "100%", value: 1.0 },
]

interface PatternStepButtonProps {
  type: "D" | "U" | null
  tick: number
  vol: number
  onToggle: () => void
  onVolumeChange: (vol: number) => void
}

export default function PatternStepButton(props: PatternStepButtonProps) {
  const activeVol = () => {
    let nearest = VOL_OPTIONS[0]
    let minDiff = Math.abs(props.vol - VOL_OPTIONS[0].value)
    for (const opt of VOL_OPTIONS) {
      const diff = Math.abs(props.vol - opt.value)
      if (diff < minDiff) {
        minDiff = diff
        nearest = opt
      }
    }
    return nearest.value
  }

  return (
    <div class="flex flex-col items-center gap-1">
      <span class="text-xs opacity-50">{props.tick + 1}</span>
      <button
        class="btn btn-square btn-sm text-lg"
        classList={{
          "btn-primary": props.type === "D",
          "btn-secondary": props.type === "U",
          "btn-ghost border-dashed border-2": props.type === null
        }}
        onClick={props.onToggle}
      >
        {props.type === "D" ? "↓" : props.type === "U" ? "↑" : ""}
      </button>
      {props.type !== null && (
        <button
          class="btn btn-square btn-sm btn-accent"
          onClick={() => {
            const idx = VOL_OPTIONS.findIndex(o => o.value === activeVol())
            const next = VOL_OPTIONS[(idx + 1) % VOL_OPTIONS.length]
            props.onVolumeChange(next.value)
          }}
        >
          {VOL_OPTIONS.find(o => o.value === activeVol())?.label}
        </button>
      )}
    </div>
  )
}
