import { createMemo, createSignal, For } from "solid-js"
import { nanoid } from "nanoid"
import { Chord } from "~/utils/guitar"
import ChordCard from "./ChordCard"
import CreateChordModal from "./CreateChordModal"
import { ChordRecord, getChordById } from "./Guitar"

interface ChordsProps {
  chords: ChordRecord[]
  onChordAdd: (chord: ChordRecord) => void
  onChordDelete: (id: string) => void
  onChordUpdate: (chord: ChordRecord) => void
  onAddToSequence: (chordId: string) => void
}

export default function Chords(props: ChordsProps) {
  let createChordModalRef: HTMLDialogElement | undefined
  const [editingChordId, setEditingChordId] = createSignal<string>()

  const initialChord = createMemo(() => {
    const id = editingChordId()
    if (id) return getChordById(props.chords, id)?.chord
  })

  const initialName = createMemo(() => {
    const id = editingChordId()
    if (id) return getChordById(props.chords, id)?.name
  })

  const handleSaveChord = (chord: Chord, name: string, id?: string) => {
    if (id) {
      props.onChordUpdate({ id, name, chord, isEditable: true })
    } else {
      props.onChordAdd({ id: nanoid(), name, chord, isEditable: true })
    }
  }

  const handleChordDelete = (id: string) => {
    props.onChordDelete(id)
  }

  const openCreateChordModal = () => {
    setEditingChordId(undefined)
    createChordModalRef?.showModal()
  }

  const handleChordEdit = (id: string) => {
    setEditingChordId(id)
    createChordModalRef?.showModal()
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="flex flex-col">
        <button
          class="card bg-base-200 border-2 border-dashed border-primary hover:border-primary-focus flex flex-col items-center justify-center p-4 cursor-pointer transition-colors flex-1"
          onClick={openCreateChordModal}
        >
          <span class="text-3xl font-bold text-primary">+</span>
          <span class="text-sm font-semibold uppercase tracking-wider text-primary">Add Chord</span>
        </button>
      </div>

      <For each={props.chords}>
        {chordRecord => (
          <ChordCard
            id={chordRecord.id}
            name={chordRecord.name}
            chord={chordRecord.chord}
            onAdd={props.onAddToSequence}
            onDelete={handleChordDelete}
            onEdit={handleChordEdit}
            isEditable={chordRecord.isEditable}
          />
        )}
      </For>

      <CreateChordModal
        id={editingChordId()}
        initialChord={initialChord()}
        initialName={initialName()}
        ref={createChordModalRef}
        onSave={handleSaveChord}
      />
    </div>
  )
}
