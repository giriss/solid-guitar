import { createEffect, createMemo, For } from "solid-js"
import { createSortable } from "@thisbeyond/solid-dnd"
import { destructure } from "@solid-primitives/destructure"
import { PatternRecord, ChordRecord, SequenceItemData, getChordById } from "./Guitar"
import CloseIcon from "~icons/mingcute/close-fill"
import DragIcon from '~icons/mingcute/dots-fill';

interface SequenceItemProps {
  patterns: PatternRecord[]
  chords: ChordRecord[]
  item: SequenceItemData
  onMerge?: VoidFunction
  onDelete: VoidFunction
  onPatternChange: (pattern: string) => void
  onBarreChange: (capo: number) => void
  isPlaying: boolean
}

export default function SequenceItem(props: SequenceItemProps) {
  const { isPlaying, item, onMerge, onDelete, onPatternChange, onBarreChange } = destructure(props)
  const isMerged = createMemo(() => item().chord.length === 2)
  const sortable = createSortable(item().id)

  let divRef: HTMLDivElement | undefined

  createEffect(() => {
    if (divRef && isPlaying()) {
      divRef.scrollIntoView({ behavior: "smooth", inline: "center" })
    }
  })

  return (
    <div
      ref={(el) => {
        divRef = el
        sortable.ref(el)
      }}
      classList={{
        "card shrink-0 relative group transition-shadow": true,
        "bg-primary text-primary-content": isPlaying(),
        "bg-base-300 text-base-content": !isPlaying() && isMerged(),
        "bg-base-200 text-base-content": !isPlaying() && !isMerged(),
        "w-50": isMerged(),
        "w-30": !isMerged(),
        "opacity-50 shadow-2xl z-50": sortable.isActiveDraggable,
        "opacity-100": !sortable.isActiveDraggable,
      }}
      style={
        sortable.transform
          ? {
              transform: `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`,
            }
          : undefined
      }
    >
      <div
        class="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...sortable.dragActivators}
      >
        <div class="p-1 text-base-content/50">
          <DragIcon />
        </div>
      </div>
      <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="btn btn-circle btn-xs btn-ghost text-error"
          onClick={onDelete()}
        >
          <CloseIcon />
        </button>
      </div>
      <div class="card-body items-center text-center justify-start" style={{ gap: "8px" }}>
        {isMerged() ? (
          <div style={{ display: "flex", "align-items": "center", gap: "8px", "flex-wrap": "wrap", "justify-content": "center" }}>
            <p class="text-sm font-bold">{getChordById(props.chords, item().chord[0])?.name}</p>
            <div style={{ width: "1px", height: "30px", "background-color": "currentColor" }}></div>
            <p class="text-sm font-bold">{getChordById(props.chords, item().chord[1]!)?.name}</p>
          </div>
        ) : (
          <p class="text-sm font-bold">{getChordById(props.chords, item().chord[0])?.name}</p>
        )}

        <div style={{ "min-width": "100%" }}>
          <select
            class="select select-sm w-full"
            value={item().pattern}
            onChange={(e) => {
              if (e.currentTarget.value) onPatternChange()(e.currentTarget.value)
            }}
          >
            <For each={props.patterns}>
              {({ id, name }) => <option value={id}>{name}</option>}
            </For>
          </select>
        </div>

        <div style={{ "min-width": "100%" }}>
          <select
            class="select select-sm w-full"
            value={item().barre ?? 0}
            onChange={(e) => {
              if (e.currentTarget.value) onBarreChange()(parseInt(e.currentTarget.value))
            }}
          >
            {[...Array(12).keys()].map((i) => (
              <option value={i}>{i === 0 ? "No Barre" : `Barre ${i}`}</option>
            ))}
          </select>
        </div>

        <button
          class="btn btn-xs btn-outline"
          onClick={onMerge ? () => onMerge()?.() : undefined}
          disabled={!(onMerge && onMerge())}
        >
          Merge
        </button>
      </div>
    </div>
  )
}
