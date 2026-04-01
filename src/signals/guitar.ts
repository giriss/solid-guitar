import { createMemo, createSignal } from "solid-js"
import { CAGED_CHORDS, Chord, PATTERNS, StrummingPattern } from "~/utils/guitar"

export interface ChordRecord {
  name: string
  chord: Chord
}

export interface PatternRecord {
  name: string
  pattern: StrummingPattern
}

export const [additionalChords, setAdditionalChords] = createSignal<Record<string, ChordRecord>>({})
export const [additionalPatterns, setAdditionalPatterns] = createSignal<Record<string, PatternRecord>>({})

const DEFAULT_CHORDS = Object.fromEntries(Object.entries(CAGED_CHORDS).map(([key, value]) => [key, { name: key, chord: value }]))
const DEFAULT_PATTERNS = Object.fromEntries(Object.entries(PATTERNS).map(([key, value]) => [key, { name: key, pattern: value }]))

export  const allChords = createMemo(() => ({ ...DEFAULT_CHORDS, ...additionalChords() }))
export const allPatterns = createMemo(() => ({ ...DEFAULT_PATTERNS, ...additionalPatterns() }))
