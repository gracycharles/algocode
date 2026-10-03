'use client';

// Tactile Haptics & Magnetic Cube Sound Engine
class HapticSoundEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedSound = localStorage.getItem('algocube_sound_enabled');
        const savedHaptics = localStorage.getItem('algocube_haptics_enabled');
        if (savedSound !== null) this.soundEnabled = savedSound === 'true';
        if (savedHaptics !== null) this.hapticsEnabled = savedHaptics === 'true';
      } catch {}
    }
  }

  private initAudio() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('algocube_sound_enabled', String(enabled));
    } catch {}
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    try {
      localStorage.setItem('algocube_haptics_enabled', String(enabled));
    } catch {}
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.hapticsEnabled || typeof window === 'undefined') return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  private playClickSound(intensity: 'crisp' | 'snap' | 'chime' | 'soft' = 'crisp') {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (intensity === 'chime') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.46);
        });
        return;
      }

      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(intensity === 'snap' ? 3600 : 2800, now);
      filter.Q.setValueAtTime(intensity === 'snap' ? 5 : 3.5, now);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(intensity === 'snap' ? 180 : 240, now);
      subOsc.frequency.exponentialRampToValueAtTime(60, now + 0.035);

      subGain.gain.setValueAtTime(0.14, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(intensity === 'snap' ? 0.22 : 0.16, now);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      noiseSource.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.042);
      subOsc.start(now);
      subOsc.stop(now + 0.038);
    } catch {}
  }

  public trigger(type: 'turn' | 'snap' | 'success' | 'reset' | 'tick' = 'turn') {
    switch (type) {
      case 'turn':
        this.vibrate(14);
        this.playClickSound('crisp');
        break;
      case 'snap':
        this.vibrate([18, 12, 16]);
        this.playClickSound('snap');
        break;
      case 'success':
        this.vibrate([40, 30, 50, 30, 90]);
        this.playClickSound('chime');
        break;
      case 'reset':
        this.vibrate(10);
        this.playClickSound('soft');
        break;
      case 'tick':
        this.vibrate(8);
        this.playClickSound('soft');
        break;
    }
  }
}

export const haptics = new HapticSoundEngine();
