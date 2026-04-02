import { For } from "solid-js"
import {
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  closestCenter,
  DragEventHandler,
} from "@thisbeyond/solid-dnd"
import SequenceItem from "./SequenceItem"
import { ChordRecord, PatternRecord, SequenceItemData } from "./Guitar"

interface SequenceContainerProps {
  patterns: PatternRecord[]
  chords: ChordRecord[]
  chordSequence: SequenceItemData[]
  onMerge: (index: number) => void
  onDelete: (index: number) => void
  onPatternChange: (index: number, pattern: string) => void
  onBarreChange: (index: number, capo: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  currentPlayingIndex?: number
}

export default function SequenceContainer(props: SequenceContainerProps) {
  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable && draggable.id !== droppable.id) {
      const fromIndex = props.chordSequence.findIndex((item) => item.id === draggable.id)
      const toIndex = props.chordSequence.findIndex((item) => item.id === droppable.id)

      if (fromIndex === -1 || toIndex === -1) return

      props.onReorder(fromIndex, toIndex)
    }
  }

  return (
    <div class="p-2.5 border border-base-300 rounded-lg flex gap-2.5 overflow-x-auto min-h-37.5 my-4">
      <DragDropProvider onDragEnd={onDragEnd} collisionDetector={closestCenter}>
        <DragDropSensors />
        <SortableProvider ids={props.chordSequence.map(({ id }) => id)}>
          <For each={props.chordSequence} fallback={<p class="text-gray-500">Add chords to sequence</p>}>
            {(item, index) => (
              <SequenceItem
                patterns={props.patterns}
                chords={props.chords}
                item={item}
                onDelete={() => props.onDelete(index())}
                onMerge={props.chordSequence.length - 1 === index() ? undefined : () => props.onMerge(index())}
                onPatternChange={pattern => props.onPatternChange(index(), pattern)}
                onBarreChange={barre => props.onBarreChange(index(), barre)}
                isPlaying={index() === props.currentPlayingIndex}
              />
            )}
          </For>
        </SortableProvider>
      </DragDropProvider>
    </div>
  )
}
