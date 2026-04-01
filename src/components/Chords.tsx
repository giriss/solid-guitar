import { createMemo, createSignal, For } from "solid-js"
import { nanoid } from "nanoid"
import { Chord } from "~/utils/guitar"
import { allChords, additionalChords, setAdditionalChords } from "~/signals/guitar"
import ChordCard from "./ChordCard"
import CreateChordModal from "./CreateChordModal"

interface ChordsProps {
  onAddToSequence: (chordId: string) => void
}

export default function Chords(props: ChordsProps) {
  let createChordModalRef: HTMLDialogElement | undefined
  const [editingChordId, setEditingChordId] = createSignal<string>()

  const initialChord = createMemo(() => {
    const id = editingChordId()
    if (id) return allChords()[id]?.chord
  })

  const initialName = createMemo(() => {
    const id = editingChordId()
    if (id) return allChords()[id]?.name
  })

  const handleSaveChord = (chord: Chord, name: string, id?: string) => {
    if (id) {
      setAdditionalChords(prev => ({ ...prev, [id]: { name, chord } }))
    } else {
      setAdditionalChords(prev => ({ ...prev, [nanoid()]: { name, chord } }))
    }
  }

  const handleChordDelete = (id: string) => {
    setAdditionalChords(prev => {
      const newChords = { ...prev }
      delete newChords[id]
      return newChords
    })
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

      <For each={Object.entries(allChords())}>
        {([id, chordRecord]) => (
          <ChordCard
            id={id}
            name={chordRecord.name}
            chord={chordRecord.chord}
            onAdd={props.onAddToSequence}
            onDelete={handleChordDelete}
            onEdit={handleChordEdit}
            isEditable={!!additionalChords()[id]}
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
