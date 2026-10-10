// Structural contract for the existing, optional Tone.js CDN adapter.
// Keeping this here prevents audio-library types from leaking into game rules.
interface Sound {
  triggerAttackRelease(noteOrDuration: string, duration?: string): void;
  triggerAttack(): void;
  triggerRelease(): void;
  toDestination(): Sound;
  dispose(): void;
}
export type GameSounds = Record<
  "damage" | "pickup" | "spray" | "win" | "lose" | "door_unlock",
  Sound
>;
export interface ToneLibrary {
  start(): Promise<void>;
  NoiseSynth: new (options: object) => Sound;
  Synth: new (options: object) => Sound;
}
