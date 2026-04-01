import { isServer } from "solid-js/web";

type StrumDirection = "D" | "U"

const A2_HZ = 110
const STRING_DISTANCE_TO_A2 = [19, 14, 10, 5, 0, -5]

function calculateFrequencyFromA2(n: number) {
  return A2_HZ * Math.pow(2, n / 12)
}

// 1. Declare the variable but don't initialize it yet
let audioCtx: AudioContext;
let noiseBuffer: AudioBuffer;

// 2. Wrap the initialization in a check or a getter
function getAudioCtx() {
  if (isServer) return null; // Don't do anything on the server

  if (!audioCtx) {
    audioCtx = new AudioContext();

    // Pre-calculate noise buffer once
    const noiseFrames = Math.floor(audioCtx.sampleRate * 0.015);
    noiseBuffer = audioCtx.createBuffer(1, noiseFrames, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let n = 0; n < noiseFrames; n++) noiseData[n] = Math.random() * 2 - 1;
  }
  return audioCtx;
}

function acousticPluck(freq: number, startTime: number, vol: number) {
  const ctx = getAudioCtx()!;
  // Bass strings sustain longer than treble (proportional to 1/sqrt(freq))
  const decayTime = Math.max(1.5, 4.5 / Math.sqrt(freq / 82));

  // Pick transient: use pre-calculated noise buffer
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = freq * 2;
  noiseFilter.Q.value = 0.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.12, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.015);

  // Primary oscillator: harmonic richness (odd + even harmonics)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq * 1.005, startTime);
  osc1.frequency.exponentialRampToValueAtTime(freq, startTime + 0.02);

  // Second oscillator: detuned ~5 cents for inharmonic beating
  const detune = freq * 1.003;
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(detune * 1.005, startTime);
  osc2.frequency.exponentialRampToValueAtTime(detune, startTime + 0.02);

  const osc2Gain = ctx.createGain();
  osc2Gain.gain.value = 0.5;

  // Brightness sweep: bright steel-string attack → warm sustain → dark decay
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(8000, startTime);
  filter.frequency.exponentialRampToValueAtTime(2500, startTime + 0.08);
  filter.frequency.exponentialRampToValueAtTime(1000, startTime + decayTime);

  // Body resonances: air cavity ~90Hz, top plate ~200Hz
  const body1 = ctx.createBiquadFilter();
  body1.type = 'peaking';
  body1.frequency.value = 90;
  body1.Q.value = 2;
  body1.gain.value = 5;

  const body2 = ctx.createBiquadFilter();
  body2.type = 'peaking';
  body2.frequency.value = 200;
  body2.Q.value = 1;
  body2.gain.value = 3;

  // Amplitude envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(vol * 0.7, startTime + 0.002);
  gain.gain.exponentialRampToValueAtTime(vol * 0.5, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decayTime);

  // osc1 + osc2 → filter → body1 → body2 → gain → out
  osc1.connect(filter);
  osc2.connect(osc2Gain);
  osc2Gain.connect(filter);
  filter.connect(body1);
  body1.connect(body2);
  body2.connect(gain);
  gain.connect(ctx.destination);

  // noise → noiseFilter → noiseGain → body resonances → gain → out
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(body1);

  const stopTime = startTime + decayTime + 0.05;
  osc1.start(startTime);
  osc1.stop(stopTime);
  osc2.start(startTime);
  osc2.stop(stopTime);
  noiseSource.start(startTime);
  noiseSource.stop(startTime + 0.02);
}

type FretNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22
type Fret = "x" | FretNumber
export type Chord = [Fret, Fret, Fret, Fret, Fret, Fret]

/**
 * Apply capo to a chord by shifting all notes up by the capo value
 * Open strings (0) become the capo position
 * Muted strings (x) remain muted
 */
export function applyCapoToChord(chord: Chord, capo: number): Chord {
  if (capo === 0) return chord
  return chord.map(fret => (fret === "x" ? "x" : (fret as number) + capo)) as Chord
}

export function strum(frets: Chord, direction: StrumDirection, delay = 0, vol: number = 0.7) {
  const freqs = frets.map(
    (v, i) => v === "x" ? "x" : calculateFrequencyFromA2(STRING_DISTANCE_TO_A2[i] + v)
  )

  const ctx = getAudioCtx()
  if (ctx!.state === 'suspended') ctx!.resume()

  const now = ctx!.currentTime;
  const STAGGER = 0.01; // 10ms

  let i = 0;
  ; (direction === "D" ? [...freqs].reverse() : freqs).forEach(v => {
    if (v === "x") return;

    acousticPluck(v, now + i * STAGGER + delay, vol);
    i++
  })
}

export type StrummingPattern = { type: StrumDirection, tick: number, vol: number }[]

interface SequenceData {
  chord: [Chord] | [Chord, Chord]
  pattern: StrummingPattern
}

const CHORD_C_MAJOR: Chord = [0, 1, 0,2, 3, "x"]
const CHORD_A_MAJOR: Chord = [0, 2, 2, 2, 0, "x"]
const CHORD_A_MINOR: Chord = [0, 1, 2, 2, 0, "x"]
const CHORD_G_MAJOR: Chord = [3, 0, 0, 0, 2, 3]
const CHORD_E_MAJOR: Chord = [0, 0, 1, 2, 2, 0]
const CHORD_E_MINOR: Chord = [0, 0, 0, 2, 2, 0]
const CHORD_D_MAJOR: Chord = [2, 3, 2, 0, "x", "x"]
const CHORD_D_MINOR: Chord = [1, 3, 2, 0, "x", "x"]

export const CAGED_CHORDS = {
  C: CHORD_C_MAJOR,
  A: CHORD_A_MAJOR,
  Am: CHORD_A_MINOR,
  G: CHORD_G_MAJOR,
  E: CHORD_E_MAJOR,
  Em: CHORD_E_MINOR,
  D: CHORD_D_MAJOR,
  Dm: CHORD_D_MINOR,
}

const D_UUD_UUD: StrummingPattern = [
  { type: "D", tick: 0, vol: 1 },
  { type: "U", tick: 3, vol: .66 },
  { type: "U", tick: 5, vol: .66 },
  { type: "D", tick: 6, vol: 1 },
  { type: "U", tick: 9, vol: .66 }, 
  { type: "U", tick: 11, vol: .66 },
  { type: "D", tick: 12, vol: 1 },
]

const D_UUD_UUD_D: StrummingPattern = [
  ...D_UUD_UUD,
  { type: "D", tick: 14, vol: .33 },
]

const D_UUD_UUD_U: StrummingPattern = [
  ...D_UUD_UUD,
  { type: "U", tick: 15, vol: .33 },
]

const D_UUD_UUD_DU: StrummingPattern = [
  ...D_UUD_UUD,
  { type: "D", tick: 14, vol: .33 },
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UU_DD: StrummingPattern = [
  { type: "D", tick: 0, vol: 1 },
  { type: "D", tick: 4, vol: 1 },
  { type: "U", tick: 7, vol: 1 },
  { type: "U", tick: 9, vol: .66 },
  { type: "D", tick: 10, vol: 1 },
  { type: "D", tick: 12, vol: .66 },
]

const D_D_UUU_D: StrummingPattern = [
  { type: "D", tick: 0, vol: 1 },
  { type: "D", tick: 4, vol: 1 },
  { type: "U", tick: 7, vol: .66 },
  { type: "U", tick: 9, vol: .66 },
  { type: "U", tick: 11, vol: .66 },
  { type: "D", tick: 12, vol: 1 },
]

const D_D_UUU_D_D: StrummingPattern = [
  ...D_D_UUU_D,
  { type: "D", tick: 14, vol: .33 },
]

const D_D_UUU_D_U: StrummingPattern = [
  ...D_D_UUU_D,
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UUU_D_DU: StrummingPattern = [
  ...D_D_UUU_D,
  { type: "D", tick: 14, vol: .33 },
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UU_DD_D: StrummingPattern = [
  ...D_D_UU_DD,
  { type: "D", tick: 14, vol: .33 },
]

const D_D_UU_DD_U: StrummingPattern = [
  ...D_D_UU_DD,
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UU_DD_DU: StrummingPattern = [
  ...D_D_UU_DD,
  { type: "D", tick: 14, vol: .33 },
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UDUD_D: StrummingPattern = [
  { type: "D",tick: 0,vol: 1 },
  { type: "D",tick: 4,vol: 1 },
  { type: "U",tick: 7,vol: 1 },
  { type: "D",tick: 8,vol: .66 },
  { type: "U",tick: 9,vol: .66 },
  { type: "D",tick: 10,vol: .66 },
  { type: "D",tick: 12,vol: 1 }
]

const D_D_UDUD_D_D: StrummingPattern = [
  ...D_D_UDUD_D,
  { type: "D", tick: 14, vol: .33 },
]

const D_D_UDUD_D_U: StrummingPattern = [
  ...D_D_UDUD_D,
  { type: "U", tick: 15, vol: .33 },
]

const D_D_UDUD_D_DU: StrummingPattern = [
  ...D_D_UDUD_D,
  { type: "D", tick: 14, vol: .33 },
  { type: "U", tick: 15, vol: .33 },
]

const DDDD_DDDDU: StrummingPattern = [
  { type: "D", tick: 0, vol: 1 },
  { type: "D", tick: 2, vol: .66 },
  { type: "D", tick: 4, vol: .66 },
  { type: "D", tick: 6, vol: .66 },
  { type: "D", tick: 8, vol: 1 },
  { type: "D", tick: 10, vol: .66 },
  { type: "D", tick: 12, vol: .66 },
  { type: "D", tick: 14, vol: .66 },
  { type: "U", tick: 15, vol: .66 },
]

export const PATTERNS: Record<string, StrummingPattern> = {
  D_UUD_UUD,
  D_UUD_UUD_D,
  D_UUD_UUD_U,
  D_UUD_UUD_DU,
  D_D_UU_DD,
  D_D_UU_DD_D,
  D_D_UU_DD_U,
  D_D_UU_DD_DU,
  D_D_UDUD_D,
  D_D_UDUD_D_D,
  D_D_UDUD_D_U,
  D_D_UDUD_D_DU,
  D_D_UUU_D,
  D_D_UUU_D_D,
  D_D_UUU_D_U,
  D_D_UUU_D_DU,
  DDDD_DDDDU,
}

const STORAGE_KEY = "guitar_custom_patterns"

export function getCustomPatterns(): Record<string, StrummingPattern> {
  if (isServer) return {}
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

export function saveCustomPattern(name: string, pattern: StrummingPattern) {
  if (isServer) return
  const custom = getCustomPatterns()
  custom[name] = pattern
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
}

export function getAllPatterns(): Record<string, StrummingPattern> {
  return { ...PATTERNS, ...getCustomPatterns() }
}

/**
 * Strum pattern D UUD UUD
 */
export function strumPattern(
  frets: [Chord] | [Chord, Chord],
  bpm: number = 80,
  delay: number = 0,
  pattern = D_D_UU_DD
) {
  const step = 60 / bpm / 4; // Duration of one 8th note

  pattern.forEach(s => {
    if (frets.length === 2) {
      strum(frets[s.tick >= 7 ? 1 : 0], s.type, s.tick * step + delay, s.vol)
    } else {
      strum(frets[0], s.type, s.tick * step + delay, s.vol)
    }
  })
}

/**
 * Calculate the duration of one strumPattern in seconds
 */
function getPatternDuration(pattern: StrummingPattern, bpm: number = 80): number {
  const step = 60 / bpm / 4 // Duration of one 16th note
  const maxTick = Math.max(...pattern.map(p => p.tick), 15)
  return (maxTick + 1) * step
}

/**
 * Play a sequence of chords with individual patterns, one after another, with proper timing
 * Uses a look-ahead scheduler to prevent performance lag on long sequences
 */
export function playSequence(
  chords: SequenceData[],
  bpm: number = 80,
  onStepChange?: (index?: number) => void
) {
  if (chords.length === 0) return

  const ctx = getAudioCtx()!;
  if (ctx.state === 'suspended') ctx.resume()

  const lookahead = 0.1 // How far ahead to schedule audio (sec)
  const scheduleInterval = 25 // How frequently to check for scheduling (ms)

  // Pre-calculate step start times relative to sequence start
  const stepStartTimes: number[] = []
  let totalDuration = 0
  chords.forEach((item) => {
    stepStartTimes.push(totalDuration)
    totalDuration += getPatternDuration(item.pattern, bpm)
  })

  let nextStepToSchedule = 0
  const playbackStartTime = ctx.currentTime + 0.02 // Small buffer to start
  let currentStepIndex = -1

  const timerId = setInterval(() => {
    const sequenceElapsed = ctx.currentTime - playbackStartTime

    // 1. Schedule audio for upcoming steps
    while (
      nextStepToSchedule < chords.length &&
      stepStartTimes[nextStepToSchedule] < sequenceElapsed + lookahead
    ) {
      const item = chords[nextStepToSchedule]
      const startTime = playbackStartTime + stepStartTimes[nextStepToSchedule]
      strumPattern(item.chord, bpm, startTime - ctx.currentTime, item.pattern)
      nextStepToSchedule++
    }

    // 2. Track UI state (onStepChange)
    if (onStepChange) {
      if (sequenceElapsed >= totalDuration) {
        onStepChange(undefined)
        clearInterval(timerId)
        return
      }

      let activeStep = -1
      for (let i = stepStartTimes.length - 1; i >= 0; i--) {
        if (sequenceElapsed >= stepStartTimes[i]) {
          activeStep = i
          break
        }
      }

      if (activeStep !== currentStepIndex) {
        currentStepIndex = activeStep
        onStepChange(activeStep)
      }
    } else if (sequenceElapsed >= totalDuration) {
      clearInterval(timerId)
    }
  }, scheduleInterval)

  // Return a cleanup function
  return () => clearInterval(timerId)
}
