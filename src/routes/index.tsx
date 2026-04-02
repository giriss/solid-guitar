import { createSignal, createEffect, For } from "solid-js"
import Guitar, { type ChordRecord, type PatternRecord, type GuitarRef, type SongParameters } from "~/components/Guitar"
import SaveSongModal from "~/components/SaveSongModal"
import { CAGED_CHORDS, PATTERNS } from "~/utils/guitar"

interface CompleteSongParameters extends SongParameters {
  name: string
}

const DEFAULT_CHORDS = Object.entries(CAGED_CHORDS).map(([id, value]) => ({ id, name: id, chord: value, isEditable: false }))
const DEFAULT_PATTERNS = Object.entries(PATTERNS).map(([id, value]) => ({ id, name: id, pattern: value }))

export default function GuitarPage() {
  const [songs, setSongs] = createSignal<CompleteSongParameters[]>([])
  const [selectedSong, setSelectedSong] = createSignal<string>("")
  let guitarRef: GuitarRef | undefined
  let modalRef: HTMLDialogElement | undefined

  createEffect(() => {
    try {
      const storedSongs = localStorage.getItem("songs")
      if (storedSongs) {
        setSongs(Object.entries<SongParameters>(JSON.parse(storedSongs)).map(
          ([key, value]) => ({ name: key, ...value })
        ))
      }
    } catch (error) {
      console.warn("Failed to load custom data from localStorage:", error)
    }
  })

  const getSongByName = (name: string) => songs().find(song => song.name === name)

  const handleSaveSong = (name: string) => {
    if (!guitarRef) return

    const songParamters = guitarRef.getSongParameters()
    const storedSongs = Object.fromEntries(songs().map(({ name, ...attrs }) => [name, attrs]))
    const updatedStoredSongs = {
      ...storedSongs,
      [name]: { ...songParamters }
    }
    localStorage.setItem("songs", JSON.stringify(updatedStoredSongs))
    setSongs(Object.entries(updatedStoredSongs).map(([name, attrs]) => ({ name, ...attrs })))
    setSelectedSong(name)
  }

  return (
    <div class="p-8 flex flex-col gap-8">
      <div class="flex flex-wrap items-end gap-4">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Select a Song</span>
          </label>
          <select
            class="select select-bordered"
            value={selectedSong()}
            onChange={(e) => setSelectedSong(e.currentTarget.value)}
          >
            <option value="">-- New song --</option>
            <For each={songs()}>
              {({ name }) => <option value={name}>{name}</option>}
            </For>
          </select>
        </div>

        <button
          class="btn btn-primary"
          onClick={() => modalRef?.showModal()}
        >
          Save Current Song
        </button>
      </div>

      <SaveSongModal
        currentName={selectedSong()}
        ref={el => modalRef = el}
        onSave={handleSaveSong}
      />

      <Guitar
        ref={ref => guitarRef = ref}
        song={selectedSong() ? getSongByName(selectedSong()!) : undefined}
        defaultChords={DEFAULT_CHORDS}
        defaultPatterns={DEFAULT_PATTERNS}
      />
    </div>
  )
}
