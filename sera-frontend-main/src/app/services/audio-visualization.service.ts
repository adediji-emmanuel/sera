import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AudioData {
  volume: number;        // 0-100 overall volume
  frequencyData: Uint8Array;  // Raw frequency data
  bassLevel: number;     // 0-100 bass frequency level
  midLevel: number;      // 0-100 mid frequency level
  trebleLevel: number;   // 0-100 treble frequency level
  voiceLevel: number;    // 0-100 human-voice-frequency band (~300Hz-3400Hz)
  isActive: boolean;     // Whether audio is actually being captured
}

export type AudioSourceType = 'microphone' | 'system' | 'none';

@Injectable({
  providedIn: 'root'
})
export class AudioVisualizationService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private systemAudioSource: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private animationFrameId: number | null = null;
  private currentSource: AudioSourceType = 'none';
  private speechSynthesisActive = false;

  private audioDataSubject = new BehaviorSubject<AudioData>({
    volume: 0,
    frequencyData: new Uint8Array(0),
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    voiceLevel: 0,
    isActive: false
  });

  private isActiveSubject = new BehaviorSubject<boolean>(false);

  public audioData$: Observable<AudioData> = this.audioDataSubject.asObservable();
  public isActive$: Observable<boolean> = this.isActiveSubject.asObservable();

  constructor() { }

  async startMicrophoneVisualization(): Promise<boolean> {
    try {
      // Stop any existing audio
      this.stopAudioVisualization();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      this.analyser.minDecibels = -75; // Normal speech is -65 to -75dBFS — keep it audible
      this.analyser.maxDecibels = -10;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Set source and start analyzing
      this.currentSource = 'microphone';
      this.isActiveSubject.next(true);
      this.analyze();

      return true;
    } catch (error) {
      console.error('Failed to start microphone visualization:', error);
      return false;
    }
  }

  startSystemAudioVisualization(audioElement: HTMLAudioElement): boolean {
    try {
      // Stop any existing audio
      this.stopAudioVisualization();

      // Create audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect audio element to analyser
      this.systemAudioSource = this.audioContext.createMediaElementSource(audioElement);
      this.systemAudioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination); // Connect to speakers

      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Set source and start analyzing
      this.currentSource = 'system';
      this.isActiveSubject.next(true);
      this.analyze();

      return true;
    } catch (error) {
      console.error('Failed to start system audio visualization:', error);
      return false;
    }
  }

  pauseVisualization(): void {
    // Stop analyzing but keep context alive
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Emit zero audio data
    this.audioDataSubject.next({
      volume: 0,
      frequencyData: new Uint8Array(0),
      bassLevel: 0,
      midLevel: 0,
      trebleLevel: 0,
      voiceLevel: 0,
      isActive: false
    });
  }

  resumeVisualization(): void {
    // Resume analyzing if we have an active context
    if (this.analyser && this.dataArray && this.animationFrameId === null) {
      this.analyze();
    }
  }

  stopAudioVisualization(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.speechSynthesisActive = false;

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.systemAudioSource) {
      this.systemAudioSource.disconnect();
      this.systemAudioSource = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.currentSource = 'none';

    // Reset audio data
    this.audioDataSubject.next({
      volume: 0,
      frequencyData: new Uint8Array(0),
      bassLevel: 0,
      midLevel: 0,
      trebleLevel: 0,
      voiceLevel: 0,
      isActive: false
    });

    this.isActiveSubject.next(false);
  }

  startSpeechSynthesisVisualization(): void {
    try {
      this.speechSynthesisActive = true;
      this.currentSource = 'system';
      this.isActiveSubject.next(true);

      // Create analyser on demand
      if (!this.analyser) {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
      }

      // Create data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Start analyzing with simulated frequency data
      this.analyzeSpeechSynthesis();
    } catch (error) {
      console.error('Failed to start speech synthesis visualization:', error);
    }
  }

  stopSpeechSynthesisVisualization(): void {
    this.speechSynthesisActive = false;
  }

  private analyzeSpeechSynthesis(): void {
    if (!this.speechSynthesisActive || !this.analyser || !this.dataArray) {
      return;
    }

    // Simulate audio data by creating pseudo-random frequency bins
    // This gives the illusion of sound visualization during TTS
    for (let i = 0; i < this.dataArray.length; i++) {
      // Create a smooth, organic-looking frequency visualization
      const baseValue = Math.sin(i * 0.1 + Date.now() * 0.001) * 50 + 50;
      this.dataArray[i] = Math.max(0, Math.min(255, baseValue + Math.random() * 40 - 20));
    }

    // Calculate overall volume (0-100)
    const volume = this.calculateVolume(this.dataArray);

    // Calculate frequency bands
    const bassLevel = this.calculateBandLevel(this.dataArray, 0, 10);
    const midLevel = this.calculateBandLevel(this.dataArray, 10, 50);
    const trebleLevel = this.calculateBandLevel(this.dataArray, 50, 128);

    // Emit audio data
    this.audioDataSubject.next({
      volume,
      frequencyData: new Uint8Array(this.dataArray),
      bassLevel,
      midLevel,
      trebleLevel,
      voiceLevel: midLevel, // speech synth uses mid for voice level
      isActive: true
    });

    // Continue analyzing
    this.animationFrameId = requestAnimationFrame(() => this.analyzeSpeechSynthesis());
  }

  private analyze(): void {
    if (!this.analyser || !this.dataArray) {
      return;
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate overall volume (0-100)
    const volume = this.calculateVolume(this.dataArray);

    // Calculate frequency bands
    const bassLevel = this.calculateBandLevel(this.dataArray, 0, 10);
    const midLevel = this.calculateBandLevel(this.dataArray, 10, 50);
    const trebleLevel = this.calculateBandLevel(this.dataArray, 50, 128);

    // Human voice band: ~300Hz to ~3400Hz
    // With fftSize=256, sampleRate ~44100Hz: each bin ≈ 172Hz
    // bin 2 ≈ 344Hz (start of voice), bin 20 ≈ 3440Hz (end of voiced speech)
    // Use PEAK (max) not average — speech only activates a few bins at a time;
    // averaging across 18 bins dilutes the signal too much.
    const voiceLevel = this.calculateBandPeak(this.dataArray, 2, 20);

    // Emit audio data
    this.audioDataSubject.next({
      volume,
      frequencyData: new Uint8Array(this.dataArray),
      bassLevel,
      midLevel,
      trebleLevel,
      voiceLevel,
      isActive: true
    });

    // Continue analyzing
    this.animationFrameId = requestAnimationFrame(() => this.analyze());
  }

  private calculateVolume(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return Math.min(100, (average / 255) * 100);
  }

  private calculateBandLevel(dataArray: Uint8Array, startIndex: number, endIndex: number): number {
    let sum = 0;
    const length = Math.min(endIndex, dataArray.length) - startIndex;

    for (let i = startIndex; i < Math.min(endIndex, dataArray.length); i++) {
      sum += dataArray[i];
    }

    const average = sum / length;
    return Math.min(100, (average / 255) * 100);
  }

  // Returns the peak (loudest) bin in a frequency range, normalized 0-100.
  // Much better than an average for detecting voice since speech energy
  // concentrates in a few bins at a time — averaging across many bins dilutes it.
  private calculateBandPeak(dataArray: Uint8Array, startIndex: number, endIndex: number): number {
    let peak = 0;
    const end = Math.min(endIndex, dataArray.length);
    for (let i = startIndex; i < end; i++) {
      if (dataArray[i] > peak) peak = dataArray[i];
    }
    return Math.min(100, (peak / 255) * 100);
  }

  isActive(): boolean {
    return this.isActiveSubject.value;
  }

  getCurrentSource(): AudioSourceType {
    return this.currentSource;
  }

  // Legacy method for backward compatibility
  async startAudioVisualization(): Promise<boolean> {
    return this.startMicrophoneVisualization();
  }
}
