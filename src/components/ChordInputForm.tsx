import { onMount, Ref, For, createSignal, createEffect } from "solid-js"
import { createStore } from "solid-js/store"
import { Chord } from "~/utils/guitar"

export interface ChordInputFormRef { getValues: () => { chord: Chord; name: string } }

interface ChordInputFormProps {
  initialChord?: Chord
  initialName?: string
  ref?: Ref<ChordInputFormRef>
}

export default function ChordInputForm(props: ChordInputFormProps) {
  const [strings, setStrings] = createStore([
    { label: "6", val: 0, mute: true },
    { label: "5", val: 0, mute: true },
    { label: "4", val: 0, mute: true },
    { label: "3", val: 0, mute: true },
    { label: "2", val: 0, mute: true },
    { label: "1", val: 0, mute: true },
  ])

  const [name, setName] = createSignal("")

  createEffect(() => {
    if (props.initialChord) {
      setStrings((s) =>
        s.map((string, index) => {
          const val = props.initialChord![5 - index]
          return { ...string, val: val === "x" ? 0 : val, mute: val !== "x" }
        })
      )
    }
    if (props.initialName) {
      setName(props.initialName)
    }
  })

  onMount(() => {
    if (!props.ref) return

    const ref = {
      getValues: () => {
        const chord = [...strings].reverse().map(
          s => !s.mute ? "x" : s.val
        ) as Chord
        return { chord, name: name() }
      }
    }

    if (typeof props.ref === "function") {
      props.ref(ref)
    } else {
      props.ref = ref
    }
  })

  return (
    <div class="flex flex-col gap-6">
      <label class="input input-bordered flex items-center gap-2 font-bold uppercase mt-2">
        Name
        <input
          type="text"
          class="grow"
          placeholder="Name the chord"
          value={name()}
          onInput={({ currentTarget: { value } }) => setName(value)}
        />
      </label>
      <div class="flex flex-row justify-around items-center px-2 bg-base-200 rounded-lg py-6 overflow-hidden">
        <For each={strings}>
          {(string, index) => (
            <div class="flex flex-col items-center gap-2 w-10 transition-opacity duration-300" classList={{ "opacity-50": !string.mute }}>
              <span class="badge badge-primary badge-sm font-bold z-10">{string.mute ? string.val : "x"}</span>
              <div class="relative h-40 w-6 flex items-center justify-center">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={string.val}
                  onInput={(e) => setStrings(index(), "val", parseInt(e.currentTarget.value))}
                  disabled={!string.mute}
                  class="range range-primary range-xs absolute w-40"
                  style={{
                    "transform": "rotate(90deg)",
                    "transform-origin": "center"
                  }}
                />
              </div>
              <span class="text-xs font-black opacity-50 z-10">{string.label}</span>
              <input
                type="checkbox"
                checked={string.mute}
                onChange={(e) => setStrings(index(), "mute", e.currentTarget.checked)}
                class="checkbox checkbox-xs checkbox-primary mt-1"
              />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
