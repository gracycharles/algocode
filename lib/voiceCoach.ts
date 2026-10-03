'use client';

// British Young Female Voice Coach Engine for Speedcubing
class VoiceCoachEngine {
  private voice: SpeechSynthesisVoice | null = null;
  private voiceLoaded: boolean = false;
  private enabled: boolean = true;
  private isSpeaking: boolean = false;

  private notationMap: Record<string, string> = {
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
    "M'": 'Middle prime',
    M2: 'Middle two',
    E: 'Equatorial slice',
    "E'": 'Equatorial prime',
    E2: 'Equatorial two',
    S: 'Standing slice',
    "S'": 'Standing prime',
    S2: 'Standing two',
    Rw: 'Right wide',
    "Rw'": 'Right wide prime',
    Rw2: 'Right wide two',
    r: 'Right wide',
    "r'": 'Right wide prime',
    r2: 'Right wide two',
    Lw: 'Left wide',
    "Lw'": 'Left wide prime',
    Lw2: 'Left wide two',
    l: 'Left wide',
    "l'": 'Left wide prime',
    l2: 'Left wide two',
    Uw: 'Up wide',
    "Uw'": 'Up wide prime',
    Uw2: 'Up wide two',
    u: 'Up wide',
    "u'": 'Up wide prime',
    u2: 'Up wide two',
    Dw: 'Down wide',
    "Dw'": 'Down wide prime',
    Dw2: 'Down wide two',
    d: 'Down wide',
    "d'": 'Down wide prime',
    d2: 'Down wide two',
    Fw: 'Front wide',
    "Fw'": 'Front wide prime',
    Fw2: 'Front wide two',
    f: 'Front wide',
    "f'": 'Front wide prime',
    f2: 'Front wide two',
    Bw: 'Back wide',
    "Bw'": 'Back wide prime',
    Bw2: 'Back wide two',
    b: 'Back wide',
    "b'": 'Back wide prime',
    b2: 'Back wide two',
    '2R': 'Inner right slice',
    "2R'": 'Inner right prime',
    '2R2': 'Inner right two',
    '2L': 'Inner left slice',
    "2L'": 'Inner left prime',
    '2L2': 'Inner left two',
    '2U': 'Inner up slice',
    "2U'": 'Inner up prime',
    '2U2': 'Inner up two',
    '2Uw2': 'Two up wide two',
    '3Rw': 'Three layer right wide',
    "3Rw'": 'Three layer right wide prime',
    '3Rw2': 'Three layer right wide two',
    '3Lw': 'Three layer left wide',
    "3Lw'": 'Three layer left wide prime',
    '3Lw2': 'Three layer left wide two',
    '3Uw': 'Three layer up wide',
    "3Uw'": 'Three layer up wide prime',
    '3Uw2': 'Three layer up wide two',
    x: 'Rotate cube up',
    "x'": 'Rotate cube down',
    x2: 'Rotate cube 180 degrees vertically',
    y: 'Rotate cube right',
    "y'": 'Rotate cube left',
    y2: 'Rotate cube 180 degrees horizontally',
    z: 'Tilt cube right',
    "z'": 'Tilt cube left',
    z2: 'Tilt cube 180 degrees',
  };

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

    // 1. British young female voices (Google UK English Female, Victoria, Alice, Libby, Sonia, Hazel, etc.)
    const britishFemaleVoice = voices.find((v) => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      const isGB = lang.includes('en-gb') || lang.includes('en-uk') || lang.includes('uk');
      const name = v.name.toLowerCase();
      const isFemale =
        name.includes('female') ||
        name.includes('victoria') ||
        name.includes('alice') ||
        name.includes('libby') ||
        name.includes('sonia') ||
        name.includes('hazel') ||
        name.includes('fiona') ||
        name.includes('serena') ||
        name.includes('martha') ||
        name.includes('wavenet-a') ||
        name.includes('wavenet-c') ||
        name.includes('standard-a') ||
        name.includes('standard-c') ||
        name.includes('neural2-a') ||
        name.includes('neural2-c');
      return isGB && isFemale;
    });

    if (britishFemaleVoice) {
      this.voice = britishFemaleVoice;
      this.voiceLoaded = true;
      return;
    }

    // 2. Any British English voice
    const britishVoice = voices.find((v) => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      return lang.includes('en-gb') || lang.includes('en-uk') || lang.includes('uk');
    });
    if (britishVoice) {
      this.voice = britishVoice;
      this.voiceLoaded = true;
      return;
    }

    // 3. Any English female voice
    const englishFemale = voices.find((v) => {
      const isEnglish = v.lang.toLowerCase().startsWith('en');
      const name = v.name.toLowerCase();
      return (
        isEnglish &&
        (name.includes('female') ||
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('moira') ||
          name.includes('ava') ||
          name.includes('zoe'))
      );
    });

    if (englishFemale) {
      this.voice = englishFemale;
      this.voiceLoaded = true;
      return;
    }

    // 4. Any English voice fallback
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
    this.isSpeaking = false;
  }

  public getCalloutText(notation: string): string {
    const clean = notation.trim();
    return this.notationMap[clean] || clean;
  }

  /**
   * Speak a crisp move callout (e.g. "Right wide", "Up", "Right wide prime")
   * Optimized for rhythmic speedcubing animation playback without clipping
   */
  public speakCallout(notation: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!this.voiceLoaded) {
      this.loadVoice();
    }

    try {
      window.speechSynthesis.cancel();
      const callout = this.getCalloutText(notation);
      const utterance = new SpeechSynthesisUtterance(callout);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'en-GB';
      utterance.pitch = 1.15;
      utterance.rate = 1.08;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  /**
   * Speak move with coaching instruction (for manual step-by-step or move details)
   */
  public speakMove(notation: string, customInstruction?: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!this.voiceLoaded) {
      this.loadVoice();
    }

    try {
      window.speechSynthesis.cancel();
      const callout = this.getCalloutText(notation);
      const fullText = customInstruction ? `${callout}. ${customInstruction}` : callout;

      const utterance = new SpeechSynthesisUtterance(fullText);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'en-GB';
      utterance.pitch = 1.14;
      utterance.rate = 1.02;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch {}
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
      utterance.pitch = options.pitch ?? 1.14;
      utterance.rate = options.rate ?? 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const voiceCoach = new VoiceCoachEngine();
