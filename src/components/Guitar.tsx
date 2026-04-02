import { createSignal, createMemo, Ref, createEffect, onMount } from "solid-js"
import { nanoid } from "nanoid"
import { Chord, playSequence, StrummingPattern, applyCapoToChord } from "~/utils/guitar"
import SequenceContainer from "./SequenceContainer"
import PlayButton from "./PlayButton"
import PatternSelector from "./PatternSelector"
import BpmSelector from "./BpmSelector"
import VolumeSelector from "./VolumeSelector"
import CapoSelector from "./CapoSelector"
import Chords from "./Chords"

export interface ChordRecord {
  id: string
  name: string
  chord: Chord
  isEditable: boolean
}

export interface PatternRecord {
  id: string
  name: string
  pattern: StrummingPattern
}

export interface SequenceItemData {
  id: string
  chord: [string] | [string, string]
  pattern: string
  barre: number
}

export interface SongParameters {
  additionalChords: ChordRecord[]
  additionalPatterns: PatternRecord[]
  sequence: SequenceItemData[]
  defaultPattern: string
  volume: number
  capo: number
  bpm: number
}

export type GuitarRef = {
  getSongParameters: () => SongParameters
}

export const getChordById = (chords: ChordRecord[], id: string) => chords.find(c => c.id === id)
export const getPatternById = (patterns: PatternRecord[], id: string) => patterns.find(p => p.id === id)

interface GuitarProps {
  defaultPatterns: PatternRecord[]
  defaultChords: ChordRecord[]
  song?: SongParameters
  ref?: Ref<GuitarRef>
}

export default function Guitar(props: GuitarProps) {
  const [chordSequence, setChordSequence] = createSignal<SequenceItemData[]>([])
  const [selectedPattern, setSelectedPattern] = createSignal<string>("D_UUD_UUD")
  const [bpm, setBpm] = createSignal<number>(80)
  const [volume, setVolume] = createSignal<number>(0.8)
  const [capo, setCapo] = createSignal<number>(0)
  const [currentPlayingIndex, setCurrentPlayingIndex] = createSignal<number>()
  const [additionalChords, setAdditionalChords] = createSignal<ChordRecord[]>([])
  const [additionalPatterns, setAdditionalPatterns] = createSignal<PatternRecord[]>([])

  const chords = createMemo(() => ([...props.defaultChords, ...additionalChords()]))
  const patterns = createMemo(() => ([...props.defaultPatterns, ...additionalPatterns()]))

  onMount(() => {
    if (!props.ref) return

    const getSongParameters = () => ({
      additionalChords: additionalChords(),
      additionalPatterns: additionalPatterns(),
      sequence: chordSequence(),
      defaultPattern: selectedPattern(),
      volume: volume(),
      capo: capo(),
      bpm: bpm(),
    })

    if (typeof props.ref === "function") {
      props.ref({ getSongParameters })
    } else {
      props.ref = { getSongParameters }
    }
  })

  createEffect(() => {
    setAdditionalChords(props.song?.additionalChords ?? [])
    setAdditionalPatterns(props.song?.additionalPatterns ?? [])
    setSelectedPattern(props.song?.defaultPattern ?? "D_UUD_UUD")
    setChordSequence(props.song?.sequence ?? [])
    setVolume(props.song?.volume ?? 0.8)
    setCapo(props.song?.capo ?? 0)
    setBpm(props.song?.bpm ?? 80)
  })

  const isPlaying = createMemo(() => currentPlayingIndex() !== undefined)

  const handleChordAdd = (chord: ChordRecord) => setAdditionalChords(prev => [...prev, chord])
  const handleChordDelete = (id: string) => setAdditionalChords(prev => prev.filter(c => c.id !== id))

  const handleChordUpdate = (updatedChord: ChordRecord) => {
    setAdditionalChords(prev => {
      const existingIndex = prev.findIndex(c => c.id === updatedChord.id)
      if (existingIndex !== -1) {
        const updatedChords = [...prev]
        updatedChords[existingIndex] = updatedChord
        return updatedChords
      }
      return prev
    })
  }

  const handlePatternAdd = (name: string, pattern: StrummingPattern) => setAdditionalPatterns(
    existing => [...existing, { id: nanoid(), name, pattern }]
  )

  const handleAddToSequence = (name: string) => {
    setChordSequence(prev => [...prev, { id: nanoid(), chord: [name], pattern: selectedPattern(), barre: 0 }])
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setChordSequence(prev => {
      const updated = [...prev]
      const [movedItem] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, movedItem)
      return updated
    })
  }

  const handlePlaySequence = () => {
    const currentCapo = capo()
    const currentVolume = volume()
    const sequence = chordSequence().map(item => ({
      ...item,
      pattern: getPatternById(patterns(), item.pattern)?.pattern.map(p => ({ ...p, vol: p.vol * currentVolume })) ?? []
    }))

    const transposedSequence = sequence.map(item => {
      let transposedChord: [Chord] | [Chord, Chord]
      const itemCapo = item.barre + currentCapo

      if (item.chord.length === 2) {
        const [c1, c2] = item.chord
        transposedChord = [applyCapoToChord(getChordById(chords(), c1)!.chord, itemCapo), applyCapoToChord(getChordById(chords(), c2)!.chord, itemCapo)]
      } else {
        transposedChord = [applyCapoToChord(getChordById(chords(), item.chord[0])!.chord, itemCapo)]
      }

      return {
        ...item,
        chord: transposedChord
      }
    })

    playSequence(transposedSequence, bpm(), setCurrentPlayingIndex)
  }

  const handlePatternChange = (index: number, pattern: string) => {
    setChordSequence(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], pattern }
      return updated
    })
  }

  const handleBarreChange = (index: number, barre: number) => {
    setChordSequence(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], barre }
      return updated
    })
  }

  const handleDeleteChord = (index: number) => {
    setChordSequence(prev => [...prev.slice(0, index), ...prev.slice(index + 1)])
  }

  const handleMergeChords = (index: number) => {
    setChordSequence(prev => {
      if (index >= prev.length - 1) return prev
      const nextItem = prev[index + 1]
      if (nextItem.chord.length === 2) return prev

      const currentItem = prev[index]
      if (currentItem.chord.length === 2) return prev

      const merged: SequenceItemData = {
        id: nanoid(),
        chord: [...currentItem.chord, ...nextItem.chord] as [string, string],
        pattern: currentItem.pattern,
        barre: currentItem.barre,
      }
      return [...prev.slice(0, index), merged, ...prev.slice(index + 2)]
    })
  }

  return (
    <div class="flex flex-col max-w-full">
      <div class="mb-8">
        <h2 class="mt-4 mb-4 text-2xl font-bold">Volume</h2>
        <VolumeSelector
          value={volume()}
          onChange={setVolume}
        />
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold">BPM</h2>
        <BpmSelector
          value={bpm()}
          onChange={setBpm}
        />
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold">Capo</h2>
        <CapoSelector
          value={capo()}
          onChange={setCapo}
        />
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold">Strum Pattern</h2>
        <PatternSelector
          patterns={patterns()}
          value={selectedPattern()}
          onChange={setSelectedPattern}
          onPatternSave={handlePatternAdd}
        />
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold">Your Chords</h2>
        <Chords
          chords={chords()}
          onChordAdd={handleChordAdd}
          onChordUpdate={handleChordUpdate}
          onChordDelete={handleChordDelete}
          onAddToSequence={handleAddToSequence}
        />
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold">Sequence</h2>
        <SequenceContainer
          chords={chords()}
          patterns={patterns()}
          chordSequence={chordSequence()}
          currentPlayingIndex={currentPlayingIndex()}
          onDelete={handleDeleteChord}
          onMerge={handleMergeChords}
          onPatternChange={handlePatternChange}
          onBarreChange={handleBarreChange}
          onReorder={handleReorder}
        />
      </div>

      <div class="flex justify-start">
        <PlayButton onPlay={handlePlaySequence} disabled={isPlaying() || chordSequence().length === 0} />
      </div>
    </div>
  )
}
