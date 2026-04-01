import { createEffect, createSignal, For } from "solid-js"
import { StrummingPattern } from "~/utils/guitar"
import PatternStepButton from "./PatternStepButton"

interface PatternEditorProps {
  value: StrummingPattern
  onSave: (name: string, pattern: StrummingPattern) => void
}

export default function PatternEditor(props: PatternEditorProps) {
  const [customName, setCustomName] = createSignal("My Custom")
  const [pattern, setPattern] = createSignal(props.value)

  createEffect(() => {
    setPattern(props.value)
  })

  type StepCell = { type: "D" | "U" | null; vol: number }

  const steps = (): StepCell[] => {
    const s: StepCell[] = Array(16).fill(null).map(() => ({ type: null, vol: 0.66 }))
    pattern().forEach(p => {
      if (p.tick < 16) s[p.tick] = { type: p.type, vol: p.vol }
    })
    return s
  }

  const toggleStep = (tick: number) => {
    const currentSteps = steps()
    const current = currentSteps[tick]
    let next: "D" | "U" | null = null
    if (current.type === null) next = "D"
    else if (current.type === "D") next = "U"
    else next = null

    const newPattern: StrummingPattern = []
    currentSteps.forEach((step, i) => {
      const finalType = i === tick ? next : step.type
      if (finalType) {
        newPattern.push({ type: finalType, tick: i, vol: i === tick && next !== null ? (next === "D" && step.type === null ? 0.66 : step.vol) : step.vol })
      }
    })
    setPattern(newPattern)
  }

  const updateVol = (tick: number, vol: number) => {
    const newPattern: StrummingPattern = pattern().map(p =>
      p.tick === tick ? { ...p, vol } : p
    )
    setPattern(newPattern)
  }

  const handleSave = () => {
    const name = customName().trim() || "Custom"
    props.onSave(name, pattern())
  }

  return (
    <div class="p-4 bg-base-200 rounded-lg flex flex-col gap-6">
      <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
        <For each={steps()}>
          {(step, i) => (
            <PatternStepButton
              type={step.type}
              tick={i()}
              vol={step.vol}
              onToggle={() => toggleStep(i())}
              onVolumeChange={(vol) => updateVol(i(), vol)}
            />
          )}
        </For>
      </div>

      <div class="flex gap-2 items-end border-t border-base-300 pt-4">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text text-xs">Pattern Name</span>
          </label>
          <input
            type="text"
            class="input input-sm input-bordered"
            value={customName()}
            onInput={(e) => setCustomName(e.currentTarget.value)}
          />
        </div>
        <button class="btn btn-sm btn-primary" onClick={handleSave}>
          Save Pattern
        </button>
      </div>
    </div>
  )
}
