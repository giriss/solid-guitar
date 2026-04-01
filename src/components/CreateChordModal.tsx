import { createSignal, JSX, Ref, Show } from "solid-js"
import { Chord } from "~/utils/guitar"
import ChordInputForm, { ChordInputFormRef } from "./ChordInputForm"

interface CreateChordModalProps {
  id?: string
  initialChord?: Chord
  initialName?: string
  onSave: (chord: Chord, name: string, id?: string) => void
  ref?: Ref<HTMLDialogElement>
}

export default function CreateChordModal(props: CreateChordModalProps) {
  let modalRef: HTMLDialogElement | undefined
  let chordInputFormRef: ChordInputFormRef | undefined
  const [isOpen, setIsOpen] = createSignal(false)

  const handleAdd = (chord: Chord, name: string) => {
    props.onSave(chord, name, props.id)
    handleClose()
  }

  const handleClose = () => {
    setIsOpen(false)
    modalRef?.close()
  }

  const handleOpen = () => {
    setIsOpen(true)
    modalRef?.showModal()
  }

  const handleSubmit: JSX.FormHTMLAttributes<HTMLFormElement>["onSubmit"] = e => {
    e.preventDefault()
    if (!chordInputFormRef) return
    const { chord, name } = chordInputFormRef.getValues()
    handleAdd(chord, name)
  }

  return (
    <dialog
      ref={(el) => {
        modalRef = el
        if (!props.ref) return
        if (typeof props.ref === "function") {
          props.ref({
            showModal: handleOpen,
            close: handleClose
          } as any)
        } else {
          (props.ref as any) = {
            showModal: handleOpen,
            close: handleClose
          }
        }
      }}
      class="modal"
    >
      <form class="modal-box max-w-sm" onSubmit={handleSubmit}>
        <h3 class="text-lg font-bold mb-4">Create New Chord</h3>
        <Show when={isOpen()}>
          <ChordInputForm
            initialChord={props.initialChord}
            initialName={props.initialName}
            ref={chordInputFormRef}
          />
        </Show>
        <div class="modal-action">
          <button class="btn" type="button" onClick={handleClose}>
            Cancel
          </button>
          <button class="btn btn-primary">
            {props.id ? "Update" : "Create"}
          </button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}
