'use client';

// British Young Female Voice Coach Engine
class VoiceCoachEngine {
  private voice: SpeechSynthesisVoice | null = null;
  private voiceLoaded: boolean = false;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('algocube_voice_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {}

      if ('speechSynthesis' in window) {
        this.loadVoice();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoice();
        };
      }
    }
  }

  private loadVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const britishFemaleVoice = voices.find((v) => {
      const langMatch =
        v.lang.toLowerCase().includes('en-gb') ||
        v.lang.toLowerCase().includes('en_gb') ||
        v.lang.toLowerCase().includes('uk');
      const name = v.name.toLowerCase();
      const isFemale =
        name.includes('female') ||
        name.includes('victoria') ||
        name.includes('fiona') ||
        name.includes('libby') ||
        name.includes('sonia') ||
        name.includes('hazel') ||
        name.includes('martha') ||
        name.includes('alice') ||
        name.includes('serena') ||
        name.includes('susan');
      return langMatch && isFemale;
    });

    if (britishFemaleVoice) {
      this.voice = britishFemaleVoice;
      this.voiceLoaded = true;
      return;
    }

    const britishVoice = voices.find(
      (v) => v.lang.toLowerCase().includes('en-gb') || v.lang.toLowerCase().includes('en_gb')
    );
    if (britishVoice) {
      this.voice = britishVoice;
      this.voiceLoaded = true;
      return;
    }

    const generalFemale = voices.find((v) => {
      const isEnglish = v.lang.toLowerCase().startsWith('en');
      const name = v.name.toLowerCase();
      return (
        isEnglish &&
        (name.includes('female') ||
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('moira'))
      );
    });

    if (generalFemale) {
      this.voice = generalFemale;
      this.voiceLoaded = true;
      return;
    }

    const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    this.voice = anyEnglish || voices[0] || null;
    this.voiceLoaded = true;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('algocube_voice_enabled', String(enabled));
    } catch {}
    if (!enabled) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public speak(
    text: string,
    options: { cancelPrior?: boolean; rate?: number; pitch?: number } = {}
  ) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!this.voiceLoaded) {
      this.loadVoice();
    }

    try {
      if (options.cancelPrior !== false) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'en-GB';
      utterance.pitch = options.pitch ?? 1.16;
      utterance.rate = options.rate ?? 1.05;

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public speakMove(notation: string, customInstruction?: string) {
    if (!this.enabled) return;

    let callout = notation;
    const clean = notation.trim();

    const notationMap: Record<string, string> = {
      R: 'Right',
      "R'": 'Right prime',
      R2: 'Right two',
      L: 'Left',
      "L'": 'Left prime',
      L2: 'Left two',
      U: 'Up',
      "U'": 'Up prime',
      U2: 'Up two',
      D: 'Down',
      "D'": 'Down prime',
      D2: 'Down two',
      F: 'Front',
      "F'": 'Front prime',
      F2: 'Front two',
      B: 'Back',
      "B'": 'Back prime',
      B2: 'Back two',
      M: 'Middle slice',
      "M'": 'Middle slice prime',
      M2: 'Middle slice two',
      Rw: 'Right wide',
      "Rw'": 'Right wide prime',
      Rw2: 'Right wide two',
      Lw: 'Left wide',
      "Lw'": 'Left wide prime',
      Lw2: 'Left wide two',
      Uw: 'Up wide',
      "Uw'": 'Up wide prime',
      Uw2: 'Up wide two',
      Dw: 'Down wide',
      "Dw'": 'Down wide prime',
      Dw2: 'Down wide two',
      '2R': 'Inner right slice',
      "2R'": 'Inner right slice prime',
      '2R2': 'Inner right slice two',
      '2L': 'Inner left slice',
      "2L'": 'Inner left slice prime',
      '2L2': 'Inner left slice two',
      '2U': 'Inner up slice',
      '2U2': 'Inner up slice two',
      '2Uw2': 'Inner up wide slice two',
      x: 'Rotate cube upwards',
      "x'": 'Rotate cube downwards',
      y: 'Rotate cube to the right',
      "y'": 'Rotate cube to the left',
      z: 'Tilt cube right',
      "z'": 'Tilt cube left',
    };

    if (notationMap[clean]) {
      callout = notationMap[clean];
    }

    if (customInstruction) {
      this.speak(`${callout}. ${customInstruction}`);
    } else {
      this.speak(callout);
    }
  }
}

export const voiceCoach = new VoiceCoachEngine();
