import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { VoiceSettingsService } from './voice-settings.service';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;

  // Observables
  private transcriptSubject = new Subject<SpeechRecognitionResult>();
  private errorSubject = new Subject<string>();
  private endSubject = new Subject<void>();

  public transcript$: Observable<SpeechRecognitionResult> = this.transcriptSubject.asObservable();
  public error$: Observable<string> = this.errorSubject.asObservable();
  public end$: Observable<void> = this.endSubject.asObservable();

  constructor(private voiceSettingsService: VoiceSettingsService) {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();

    // Configuration — language comes from saved settings (default en-IN)
    this.recognition.continuous = true; // Keep listening until stopped manually
    this.recognition.interimResults = true; // Get partial results while speaking
    this.recognition.lang = this.voiceSettingsService.getSettings().speechLanguage;
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        if (confidence > 0.5 || isFinal) {
          console.log('Speech result processed:', { transcript, isFinal });
        }

        this.transcriptSubject.next({ transcript, confidence, isFinal });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isListening = false;
      }
      this.errorSubject.next(event.error);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      if (this.isListening) {
        console.log('Restarting speech recognition...');
        try {
          this.recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          this.isListening = false;
          this.endSubject.next();
        }
      } else {
        this.endSubject.next();
      }
    };

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
    };
  }

  /** Change the recognition language at runtime. Restarts if currently listening. */
  setLanguage(lang: string): void {
    if (!this.recognition) return;
    const wasListening = this.isListening;
    if (wasListening) {
      this.recognition.abort();
      this.isListening = false;
    }
    this.recognition.lang = lang;
    console.log('Speech recognition language set to:', lang);
    if (wasListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to restart after language change:', e);
      }
    }
  }

  startListening(): boolean {
    if (!this.recognition) {
      console.error('Speech Recognition not initialized');
      return false;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error: any) {
      if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
        console.warn('Speech recognition already started (state mismatch fixed)');
        this.isListening = true;
        return true;
      }
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }
}
