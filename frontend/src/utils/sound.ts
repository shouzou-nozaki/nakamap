export function playStampSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // C5 → E5 → G5 の上昇チャイム
    playNote(523.25, ctx.currentTime, 0.25);
    playNote(659.25, ctx.currentTime + 0.13, 0.25);
    playNote(783.99, ctx.currentTime + 0.26, 0.45);
  } catch {
    // 音声APIが使えない環境では無視
  }
}
