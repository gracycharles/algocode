'use client';

// Screen Wake Lock (Always-On) & Fullscreen Controller
type WakeLockSentinelType = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

class ScreenManager {
  private wakeLock: WakeLockSentinelType | null = null;
  private isWakeLockActive: boolean = false;
  private isAlwaysOnEnabled: boolean = true;
  private listeners: Set<(state: { alwaysOn: boolean; fullscreen: boolean }) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('algocube_always_on');
        if (saved !== null) {
          this.isAlwaysOnEnabled = saved === 'true';
        }
      } catch {}

      this.initWakeLock();

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isAlwaysOnEnabled) {
          this.requestWakeLock();
        }
      });

      document.addEventListener('fullscreenchange', () => {
        this.notifyListeners();
      });
    }
  }

  private async initWakeLock() {
    if (this.isAlwaysOnEnabled) {
      await this.requestWakeLock();
    }
  }

  public async requestWakeLock(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.isWakeLockActive = true;

      this.wakeLock?.addEventListener('release', () => {
        this.isWakeLockActive = false;
        this.notifyListeners();
      });

      this.notifyListeners();
      return true;
    } catch {
      this.isWakeLockActive = false;
      this.notifyListeners();
      return false;
    }
  }

  public async releaseWakeLock(): Promise<void> {
    if (this.wakeLock && !this.wakeLock.released) {
      try {
        await this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
      this.isWakeLockActive = false;
      this.notifyListeners();
    }
  }

  public setAlwaysOn(enabled: boolean) {
    this.isAlwaysOnEnabled = enabled;
    try {
      localStorage.setItem('algocube_always_on', String(enabled));
    } catch {}

    if (enabled) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
    this.notifyListeners();
  }

  public isAlwaysOn(): boolean {
    return this.isAlwaysOnEnabled;
  }

  public isLockActive(): boolean {
    return this.isWakeLockActive;
  }

  public isFullscreen(): boolean {
    if (typeof document === 'undefined') return false;
    return !!document.fullscreenElement;
  }

  public async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') return;

    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {}
    this.notifyListeners();
  }

  public subscribe(
    callback: (state: { alwaysOn: boolean; fullscreen: boolean; lockActive: boolean }) => void
  ) {
    const wrapped = () =>
      callback({
        alwaysOn: this.isAlwaysOnEnabled,
        fullscreen: this.isFullscreen(),
        lockActive: this.isWakeLockActive,
      });
    this.listeners.add(wrapped);
    wrapped();
    return () => {
      this.listeners.delete(wrapped);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) =>
      fn({
        alwaysOn: this.isAlwaysOnEnabled,
        fullscreen: this.isFullscreen(),
      })
    );
  }
}

export const screenManager = new ScreenManager();
