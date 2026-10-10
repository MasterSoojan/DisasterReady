type Effect = "correct" | "wrong" | "win";
const effects: Record<Effect, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  win: "/sounds/win.mp3",
};

/** Owns every loop/effect. Audio failure never controls the learning session. */
export function createDrillAudio(
  background: string | null,
  onFailure: () => void,
) {
  const owned = new Map<HTMLAudioElement, () => void>();
  let disposed = false;
  const play = (source: string, loop: boolean) => {
    if (disposed) return;
    let audio: HTMLAudioElement;
    try {
      audio = new Audio(source);
    } catch {
      queueMicrotask(() => {
        if (!disposed) onFailure();
      });
      return;
    }
    audio.loop = loop;
    audio.volume = loop ? 0.3 : 0.5;
    let settled = false;
    const deadline = setTimeout(() => failure(), 8000);
    const ready = () => clearTimeout(deadline);
    const release = () => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      audio.removeEventListener("playing", ready);
      audio.removeEventListener("ended", release);
      audio.removeEventListener("error", failure);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      owned.delete(audio);
    };
    const failure = () => {
      if (settled) return;
      release();
      if (!disposed) onFailure();
    };
    owned.set(audio, release);
    audio.addEventListener("playing", ready);
    audio.addEventListener("ended", release);
    audio.addEventListener("error", failure);
    try {
      void audio.play().then(ready, failure);
    } catch {
      queueMicrotask(failure);
    }
  };
  if (background) play(background, true);
  return {
    playEffect: (effect: Effect) => play(effects[effect], false),
    dispose: () => {
      disposed = true;
      for (const release of owned.values()) release();
      owned.clear();
    },
  };
}
