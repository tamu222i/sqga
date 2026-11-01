/**
 * Procedural Web Audio API ASMR Synthesizer
 * Zero external audio dependencies, instant zero-latency playback.
 */

export class WebAudioAsmrEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bassBoostNode: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.bassBoostNode = this.ctx.createBiquadFilter();
      this.bassBoostNode.type = 'lowshelf';
      this.bassBoostNode.frequency.setValueAtTime(160, this.ctx.currentTime);
      this.bassBoostNode.gain.setValueAtTime(4.5, this.ctx.currentTime); // Rich cozy ASMR low-end

      this.bassBoostNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Pre-generate 3-second noise buffer
      const bufferSize = this.ctx.sampleRate * 3;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setBassBoost(enabled: boolean) {
    if (this.bassBoostNode && this.ctx) {
      this.bassBoostNode.gain.setValueAtTime(enabled ? 4.5 : 0, this.ctx.currentTime);
    }
  }

  /**
   * 1. Tape Cut Sound (Scissors / Cutter slide with friction zip)
   */
  public playTapeCut(speedRatio: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.noiseBuffer || !this.bassBoostNode) return;

    const now = ctx.currentTime;
    const duration = Math.max(0.08, 0.22 / Math.max(0.5, speedRatio));

    // Highpass noise for friction
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200 * speedRatio, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + duration);
    filter.Q.setValueAtTime(4.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassBoostNode);

    noiseSource.start(now);
    noiseSource.stop(now + duration);

    // Micro snap click
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(oscGain);
    oscGain.connect(this.bassBoostNode);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * 2. Foil Tear / Crinkle Sound (Aluminum blind bag rustling)
   */
  public playFoilCrinkle(intensity: number = 0.7) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.noiseBuffer || !this.bassBoostNode) return;

    const now = ctx.currentTime;
    // Multi-grain burst
    const grainCount = 4 + Math.floor(Math.random() * 4);

    for (let i = 0; i < grainCount; i++) {
      const delay = (i * 0.02) + Math.random() * 0.02;
      const grainDur = 0.04 + Math.random() * 0.06;

      const source = ctx.createBufferSource();
      source.buffer = this.noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2800 + Math.random() * 3500, now + delay);
      bandpass.Q.setValueAtTime(8 + Math.random() * 10, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.3 * intensity, now + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + grainDur);

      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.bassBoostNode);

      source.start(now + delay);
      source.stop(now + delay + grainDur);
    }
  }

  /**
   * 3. Memory Foam Slow-Rise Sigh (Deep decompression air whoosh)
   */
  public playFoamSigh(force: number = 0.8) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.noiseBuffer || !this.bassBoostNode) return;

    const now = ctx.currentTime;
    const duration = 0.45 + force * 0.35;

    // Soft airy filtered noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(140 + force * 200, now);
    lowpass.frequency.exponentialRampToValueAtTime(380, now + duration * 0.4);
    lowpass.frequency.exponentialRampToValueAtTime(100, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4 * force, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.bassBoostNode);

    noise.start(now);
    noise.stop(now + duration);

    // Warm sub-bass rumble
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75, now);
    subOsc.frequency.exponentialRampToValueAtTime(50, now + duration);
    subGain.gain.setValueAtTime(0.25 * force, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(this.bassBoostNode);
    subOsc.start(now);
    subOsc.stop(now + duration);
  }

  /**
   * 4. Water Gel Squeak (Rubbery high squeak)
   */
  public playGelSqueak(force: number = 0.7, pitchMod: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.bassBoostNode) return;

    const now = ctx.currentTime;
    const duration = 0.12 + Math.random() * 0.08;

    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    const startFreq = (900 + Math.random() * 400) * pitchMod;
    carrier.frequency.setValueAtTime(startFreq, now);
    carrier.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + duration * 0.4);
    carrier.frequency.exponentialRampToValueAtTime(startFreq * 0.7, now + duration);

    modulator.type = 'triangle';
    modulator.frequency.setValueAtTime(180, now);
    modGain.gain.setValueAtTime(320 * force, now);

    modulator.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(0.01, now);
    mainGain.gain.linearRampToValueAtTime(0.35 * force, now + 0.02);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    carrier.connect(mainGain);
    mainGain.connect(this.bassBoostNode);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + duration);
    modulator.stop(now + duration);
  }

  /**
   * 5. Slime Bubble Pop & Floam Crunch (Multiple crispy popping beads)
   */
  public playSlimePop(intensity: number = 0.8) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.bassBoostNode) return;

    const now = ctx.currentTime;
    const popCount = 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < popCount; i++) {
      const delay = (i * 0.018) + Math.random() * 0.02;
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = 'sine';
      const baseFreq = 400 + Math.random() * 800;
      popOsc.frequency.setValueAtTime(baseFreq * 2.5, now + delay);
      popOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + delay + 0.035);

      popGain.gain.setValueAtTime(0.001, now + delay);
      popGain.gain.linearRampToValueAtTime(0.28 * intensity, now + delay + 0.004);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.035);

      popOsc.connect(popGain);
      popGain.connect(this.bassBoostNode);

      popOsc.start(now + delay);
      popOsc.stop(now + delay + 0.04);
    }
  }

  /**
   * 6. Mochi Squelch (Soft doughy damp squish)
   */
  public playMochiSquelch(force: number = 0.7) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.bassBoostNode) return;

    const now = ctx.currentTime;
    const duration = 0.18;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260 * (1 + (1 - force) * 0.5), now);
    osc.frequency.exponentialRampToValueAtTime(110, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4 * force, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.bassBoostNode);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 7. Fingernail Acrylic Tap (High precision click / gentle tap)
   */
  public playAcrylicTap() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.noiseBuffer || !this.bassBoostNode) return;

    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(3200 + Math.random() * 600, now);
    bandpass.Q.setValueAtTime(22, now); // Sharp tap resonance

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.bassBoostNode);

    noise.start(now);
    noise.stop(now + 0.03);
  }

  /**
   * 8. Roblox-style Fanfare Level-Up Chime
   */
  public playRevealChime(rarity: string) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.bassBoostNode) return;

    const now = ctx.currentTime;
    // Pentatonic arpeggio chords
    const chordNotes = rarity === 'mythic' || rarity === 'legendary'
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
      : rarity === 'epic'
      ? [440.0, 554.37, 659.25, 880.0] // A4, C#5, E5, A5
      : [392.0, 493.88, 587.33, 783.99]; // G4, B4, D5, G5

    chordNotes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.bassBoostNode!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  /**
   * 9. Confetti Pop
   */
  public playConfettiPop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!this.bassBoostNode) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.bassBoostNode);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const asmrAudio = new WebAudioAsmrEngine();
