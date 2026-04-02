import { createSignal, For } from "solid-js"
import { StrummingPattern } from "~/utils/guitar"
import { PatternRecord, getPatternById } from "./Guitar"
import PatternEditor from "./PatternEditor"

interface PatternSelectorProps {
  patterns: PatternRecord[]
  value: string
  onChange: (pattern: string) => void
  onPatternSave: (name: string, pattern: StrummingPattern) => void
}

export default function PatternSelector(props: PatternSelectorProps) {
  const [showEditor, setShowEditor] = createSignal(false)

  return (
    <div class="flex flex-col gap-4">
      <div class="flex gap-2 items-center">
        <select
          class="select select-bordered"
          value={props.value}
          onChange={(e) => {
            const pattern = getPatternById(props.patterns, e.currentTarget.value)
            if (pattern) props.onChange(e.currentTarget.value)
          }}
        >
          <option value="" disabled selected={!props.value}>Select pattern</option>
          <For each={props.patterns}>
            {({ id, name }) => <option value={id} selected={id === props.value}>{name}</option>}
          </For>
        </select>

        <button
          class="btn btn-outline"
          onClick={() => setShowEditor(!showEditor())}
        >
          {showEditor() ? "Close Editor" : "Edit Pattern"}
        </button>
      </div>

      {showEditor() && (
        <PatternEditor
          value={getPatternById(props.patterns, props.value)!.pattern}
          onSave={(name, pattern) => {
            props.onPatternSave(name, pattern)
            setShowEditor(false)
          }}
        />
      )}
    </div>
  )
}
