import { Show } from "solid-js"
import { Chord, strum } from "~/utils/guitar"
import AddIcon from '~icons/mingcute/add-fill'
import PlayIcon from '~icons/mingcute/play-line'
import EditIcon from '~icons/mingcute/edit-2-line'
import CloseIcon from '~icons/mingcute/close-fill'

interface ChordCardProps {
  id: string
  isEditable?: boolean
  name: string
  chord: Chord
  onAdd: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function ChordCard(props: ChordCardProps) {
  return (
    <div class="card bg-neutral text-neutral-content w-full h-full relative group">
      <Show when={props.isEditable}>
        <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="btn btn-circle btn-xs btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              props.onEdit(props.id)
            }}
          >
            <EditIcon />
          </button>
          <button
            class="btn btn-circle btn-xs btn-ghost text-error"
            onClick={(e) => {
              e.stopPropagation();
              props.onDelete(props.id)
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </Show>
      <div class="card-body items-center text-center p-4">
        <h2 class="card-title">{props.name}</h2>
        <p>{[...props.chord].reverse().join("")}</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary btn-sm" onClick={() => props.onAdd(props.id)}>
            <AddIcon /> Add
          </button>
          <button class="btn btn-secondary btn-sm" onClick={() => strum(props.chord, "D")}>
            <PlayIcon /> Play
          </button>
        </div>
      </div>
    </div>
  )
}
