import { createSignal, createEffect, For } from "solid-js"
import Guitar, { type GuitarRef, type Song } from "~/components/Guitar"
import SaveSongModal from "~/components/SaveSongModal"

export default function GuitarPage() {
  const [songs, setSongs] = createSignal<Record<string, Song>>({})
  const [selectedSong, setSelectedSong] = createSignal<string>("")
  let guitarRef: GuitarRef | undefined
  let modalRef: HTMLDialogElement | undefined

  createEffect(() => {
    try {
      const storedSongs = localStorage.getItem("songs")
      if (storedSongs) {
        setSongs(JSON.parse(storedSongs))
      }
    } catch (error) {
      console.warn("Failed to load custom data from localStorage:", error)
    }
  })

  const handleSaveSong = (name: string) => {
    if (!guitarRef) return

    const song = guitarRef.getSong()
    const updatedSongs = { ...songs(), [name]: song }
    localStorage.setItem("songs", JSON.stringify(updatedSongs))
    setSongs(updatedSongs)
    setSelectedSong(name)
  }

  return (
    <div class="p-8">
      <div class="flex flex-wrap items-end gap-4 mb-8">
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
            <For each={Object.keys(songs())}>
              {(name) => <option value={name}>{name}</option>}
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
        song={selectedSong() ? songs()[selectedSong()!] : undefined}
      />
    </div>
  )
}
