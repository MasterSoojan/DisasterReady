import type { GameSounds, ToneLibrary } from "./audio";

let pending: Promise<ToneLibrary | null> | undefined;
export function loadTone(): Promise<ToneLibrary | null> {
  const existing = (window as Window & { Tone?: ToneLibrary }).Tone;
  if (existing) return Promise.resolve(existing);
  if (pending) return pending;
  pending = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js";
    script.async = true;
    const finish = (tone: ToneLibrary | null) => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (!tone) script.remove();
      resolve(tone);
    };
    const timeout = setTimeout(() => finish(null), 8000);
    script.onload = () =>
      finish((window as Window & { Tone?: ToneLibrary }).Tone ?? null);
    script.onerror = () => finish(null);
    document.head.appendChild(script);
  });
  return pending;
}

export function createSounds(Tone: ToneLibrary): GameSounds {
  return {
    damage: new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0 },
    }).toDestination(),
    pickup: new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).toDestination(),
    spray: new Tone.NoiseSynth({
      noise: { type: "white" },
      volume: -20,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 },
    }).toDestination(),
    win: new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.5 },
    }).toDestination(),
    lose: new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.2, decay: 1, sustain: 0, release: 0.5 },
    }).toDestination(),
    door_unlock: new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination(),
  };
}
