import { createEffect, createSignal, JSX, Ref } from "solid-js"

interface SaveSongModalProps {
  currentName?: string
  onSave: (name: string) => void
  ref?: Ref<HTMLDialogElement>
}

export default function SaveSongModal(props: SaveSongModalProps) {
  const [songNameInput, setSongNameInput] = createSignal("")
  let modalRef: HTMLDialogElement | undefined

  createEffect(() => {
    setSongNameInput(props.currentName ?? "")
  })

  const handleSave: JSX.FormHTMLAttributes<HTMLFormElement>["onSubmit"] = e => {
    e.preventDefault()
    const name = songNameInput().trim()
    if (name) {
      props.onSave(name)
      setSongNameInput("")
      modalRef?.close()
    }
  }

  const handleClose = () => {
    setSongNameInput("")
    modalRef?.close()
  }

  return (
    <dialog 
      ref={(el) => {
        modalRef = el
        if (!props.ref) return
        if (typeof props.ref === "function") {
          props.ref(el)
        } else {
          props.ref = el
        }
      }} 
      class="modal"
    >
      <form class="modal-box" onSubmit={handleSave}>
        <h3 class="text-lg font-bold">Save Song</h3>
        <p class="py-4">Enter a name for your song configuration:</p>
        <input
          type="text"
          name="songName"
          placeholder="Song name"
          class="input input-bordered w-full"
          value={songNameInput()}
          onInput={(e) => setSongNameInput(e.currentTarget.value)}
        />
        <div class="modal-action">
          <button class="btn" type="button" onClick={handleClose}>Cancel</button>
          <button class="btn btn-primary" type="submit" disabled={!songNameInput().trim()}>
            Save
          </button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}
