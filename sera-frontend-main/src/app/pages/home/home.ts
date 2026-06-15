import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ParticleCanvasComponent } from '../../components/particle-canvas/particle-canvas.component';
import { ChatPanelComponent } from '../../components/chat-panel/chat-panel.component';
import { HudHeaderComponent } from '../../components/hud-header/hud-header.component';
import { ControlsDockComponent } from '../../components/controls-dock/controls-dock.component';
import { SideDockComponent } from '../../components/side-dock/side-dock.component';
import { ClockService } from '../../services/clock.service';
import { ThemeService } from '../../services/theme.service';
import { VisualizationMode } from '../../services/particle-system.service';
import { AudioVisualizationService, AudioData } from '../../services/audio-visualization.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { ElevenLabsService } from '../../services/eleven-labs.service';
import { VoiceSettingsService } from '../../services/voice-settings.service';
import { IntentService } from '../../services/backend-services/intent.service';
import { CommandService } from '../../services/command.service';
import { IntentResponse } from '../../models/intent.model';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ParticleCanvasComponent,
    ChatPanelComponent,
    HudHeaderComponent,
    ControlsDockComponent,
    SideDockComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State
  currentMode: VisualizationMode = 'sphere';
  isChatOpen = false;
  isListening = false;
  isHeartMode = false;
  isEmojiMode = false;
  isAudioActive = false;
  isSystemSpeaking = false;

  // Display data
  systemText = 'SYSTEM ONLINE';
  transcriptText = 'How can I help you?';
  showTranscript = false;
  time = '00:00';
  date = 'JAN 01 2026';

  // Speech recognition
  private interimTranscript = '';
  private fullTranscript = '';

  voices: SpeechSynthesisVoice[] = [];
  selectedVoice?: SpeechSynthesisVoice;
  intentService = inject(IntentService)
  commandService = inject(CommandService)
  constructor(
    private clockService: ClockService,
    private themeService: ThemeService,
    private audioService: AudioVisualizationService,
    private speechService: SpeechRecognitionService,
    private elevenLabsService: ElevenLabsService,
    private voiceSettingsService: VoiceSettingsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.clockService.clock$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clockData => {
        this.time = clockData.time;
        this.date = clockData.date;
      });

    // Initialize theme
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Theme changes are handled by the service updating CSS variables
      });

    // Monitor audio visualization state
    this.audioService.isActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isActive => {
        this.isAudioActive = isActive;
        if (isActive) {
          this.systemText = 'AUDIO REACTIVE MODE';
        } else if (!this.isListening && !this.isHeartMode && !this.isEmojiMode) {
          this.systemText = 'SYSTEM ONLINE';
        }
      });

    // Check if speech recognition is supported
    if (!this.speechService.isSupported()) {
      console.warn('Speech Recognition not supported in this browser');
    }

    // Listen for speech results
    this.speechService.transcript$
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // Ignore any results that arrive while the system is speaking
        if (this.isSystemSpeaking) return;

        if (result.isFinal) {
          // Accumulate final chunk into the pending buffer
          this.pendingTranscript = (this.pendingTranscript + ' ' + result.transcript).trim();
          this.fullTranscript = (this.fullTranscript + ' ' + result.transcript).trim();
          this.transcriptText = this.pendingTranscript;
          this.interimTranscript = '';
          console.log('Final chunk (buffered):', result.transcript);
        } else {
          // Interim — show in UI, but also reset the debounce timer
          // (user is mid-sentence, don't process yet)
          this.interimTranscript = result.transcript;
          this.transcriptText = result.transcript;
        }

        // Reset the 3-second silence debounce on every new bit of speech
        this.resetSpeechDebounce();
        this.cdr.markForCheck();
      });

    // Listen for speech end (recognition session ended naturally)
    this.speechService.end$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Speech ended');
        // If there is still a pending transcript waiting (debounce hasn't fired yet),
        // flush it immediately now that the session ended.
        if (this.isListening && this.pendingTranscript) {
          this.flushPendingTranscript();
        } else if (this.isListening && this.interimTranscript) {
          this.pendingTranscript = this.interimTranscript;
          this.flushPendingTranscript();
        }
      });

    // Listen for errors
    this.speechService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        console.error('Speech error:', error);
        if (error === 'no-speech') {
          // Ignore no-speech errors in continuous mode, just clear transcript if needed
          console.log('No speech detected, continuing...');
        } else if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.transcriptText = 'Error: Microphone access denied';
          this.showTranscript = true;
          this.stopListening();
        } else {
          this.transcriptText = 'Error: ' + error;
          this.showTranscript = true;
          // Don't stop for other transient network errors
        }
        this.cdr.markForCheck();
      });

    // Monitor audio volume for visual feedback
    this.audioService.audioData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: AudioData) => {
        // Only apply wave/sphere switching if user is listening and system is not speaking
        if (this.isListening && !this.isHeartMode && !this.isEmojiMode && !this.isSystemSpeaking) {
          // Use voiceLevel (300Hz–3400Hz band) to detect human speech specifically.
          // This avoids triggering on background noise, AC hum, keyboard clicks, etc.
          // Threshold of 25 requires a meaningful voice signal — background noise typically stays < 15.
          const isVoiceDetected = data.voiceLevel > 25;

          if (isVoiceDetected) {
            // Voice detected — cancel any pending switch back to sphere
            if (this.silenceTimer) {
              clearTimeout(this.silenceTimer);
              this.silenceTimer = null;
            }

            if (this.currentMode !== 'wave') {
              this.currentMode = 'wave';
              this.showTranscript = true;
              this.cdr.markForCheck();
            }
          } else {
            // No voice — start a debounced timer to return to sphere
            if (this.currentMode === 'wave' && !this.silenceTimer) {
              this.silenceTimer = setTimeout(() => {
                this.currentMode = 'sphere';
                this.showTranscript = false;
                this.silenceTimer = null;
                this.cdr.markForCheck();
              }, 2000); // 2s of silence before switching back to sphere
            } else if (this.currentMode === 'sphere' && this.silenceTimer) {
              clearTimeout(this.silenceTimer);
              this.silenceTimer = null;
            }
          }
        }
      });

    this.loadVoices();
  }

  // Timer for debouncing the switch back to sphere
  private silenceTimer: any = null;

  // Debounce timer: wait for 3s of silence before processing speech
  private speechDebounceTimer: any = null;
  private pendingTranscript = ''; // Accumulated text waiting to be processed
  private readonly SPEECH_DEBOUNCE_MS = 3000;

  ngOnDestroy(): void {
    this.cancelSpeechDebounce();
    this.audioService.stopAudioVisualization();
    this.speechService.abort();
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onMicClick(): Promise<void> {
    if (this.isListening) {
      this.stopListening();
      return;
    }

    // Start listening
    this.resetStates();
    this.isListening = true;
    this.currentMode = 'sphere'; // Start as blob, will switch to wave on voice
    this.showTranscript = true;
    this.systemText = '🎤 LISTENING...';
    this.transcriptText = 'Listening...';
    this.interimTranscript = '';

    console.log('Starting microphone, mode:', this.currentMode, 'isListening:', this.isListening);
    this.fullTranscript = '';
    this.cdr.markForCheck();

    // Start speech recognition first to ensure it grabs the mic permissions/stream
    const speechStarted = this.speechService.startListening();

    // Then start audio visualization (which uses getUserMedia)
    // Sometimes starting them in parallel causes one to fail or hear silence
    const audioStarted = await this.audioService.startMicrophoneVisualization();

    if (!audioStarted || !speechStarted) {
      console.error('Failed to start microphone or speech recognition');
      this.transcriptText = '❌ Microphone access denied or speech recognition not available';
      this.showTranscript = true;
      this.stopListening();
    }
  }

  private stopListening(): void {
    this.isListening = false;
    this.cancelSpeechDebounce(); // Clear any pending debounce
    this.audioService.stopAudioVisualization();
    this.speechService.stopListening();
    this.cdr.markForCheck();
  }

  /**
   * Resets (or starts) the 3-second silence timer.
   * Called on every interim or final speech result.
   * Only fires processing after the user has been silent for SPEECH_DEBOUNCE_MS.
   */
  private resetSpeechDebounce(): void {
    if (this.speechDebounceTimer) {
      clearTimeout(this.speechDebounceTimer);
    }
    // Only start the timer if there's something pending to send
    if (this.pendingTranscript) {
      this.speechDebounceTimer = setTimeout(() => {
        this.flushPendingTranscript();
      }, this.SPEECH_DEBOUNCE_MS);
    }
  }

  /**
   * Cancels the debounce timer without processing — used when the system
   * starts speaking so we don't accidentally fire a response mid-playback.
   */
  private cancelSpeechDebounce(): void {
    if (this.speechDebounceTimer) {
      clearTimeout(this.speechDebounceTimer);
      this.speechDebounceTimer = null;
    }
    this.pendingTranscript = '';
    this.interimTranscript = '';
  }

  /**
   * Immediately processes the accumulated pending transcript.
   * Clears both the timer and the buffer.
   */
  private flushPendingTranscript(): void {
    if (this.speechDebounceTimer) {
      clearTimeout(this.speechDebounceTimer);
      this.speechDebounceTimer = null;
    }
    const toProcess = this.pendingTranscript.trim();
    this.pendingTranscript = '';
    if (toProcess) {
      console.log('Debounce fired — processing accumulated speech:', toProcess);
      this.onSpeechComplete(toProcess);
    }
  }

  private onSpeechComplete(transcript: string): void {
    // Continuous listening - just update text and keep listening
    this.transcriptText = transcript;

    // Don't stop visualization or listening
    // The visual mode will automatically switch back to sphere via audioData subscription when silence returns

    // Logic to send to AI can go here (without stopping recognition)
    console.log('Speech processed:', transcript);
    console.log('Full conversation history:', this.fullTranscript);

    this.intentService.detectIntent(transcript).subscribe((response: IntentResponse) => {
      console.log('Intent detected:', response);
      this.commandService.executeCommand(response.intent)
    });

    // Demo: Echo back using TTS
    this.onAssistantSpeak(`I heard: ${transcript}`);
  }

  onTextSubmit(text: string): void {
    if (this.isListening) {
      this.stopListening();
    }

    this.transcriptText = text;
    this.fullTranscript = (this.fullTranscript + ' ' + text).trim();
    this.showTranscript = true;
    this.cdr.markForCheck();

    console.log('Text input processed:', text);

    // Simulate AI response
    // In a real app, this would call an LLM service
    // For now, we echoed back what was typed, or give a generic response

    // Simple command handling for demo purposes
    const lowerText = text.toLowerCase();
    if (lowerText.includes('time')) {
      this.onAssistantSpeak(`It is currently ${this.time}`);
    } else if (lowerText.includes('date')) {
      this.onAssistantSpeak(`Today is ${this.date}`);
    } else {
      this.onAssistantSpeak(`I received your message: "${text}"`);
    }
  }

  private async onAssistantSpeak(response: string): Promise<void> {
    // Cancel any pending debounced speech immediately — system is taking over
    this.cancelSpeechDebounce();

    // Mark system as speaking BEFORE stopping recognition to block any late results
    this.isSystemSpeaking = true;

    // Stop listening while AI speaks to avoid "hearing itself"
    this.speechService.stopListening();
    this.audioService.stopAudioVisualization();

    // Update UI
    this.transcriptText = `AI: "${response}"`;
    this.systemText = '🔊 ASSISTANT SPEAKING';
    this.cdr.markForCheck();

    const settings = this.voiceSettingsService.getSettings();

    if (settings.type === 'eleven-labs') {
      await this.speakWithElevenLabs(response);
    } else {
      await this.speakWithSystem(response);
    }
  }

  private async speakWithElevenLabs(text: string): Promise<void> {
    try {
      // Generate speech using ElevenLabs
      const audioUrl = await this.elevenLabsService.generateSpeech(text);
      const audio = new Audio(audioUrl);

      // Mark system as speaking
      this.isSystemSpeaking = true;
      this.currentMode = 'sphere'; // Show sphere visualization
      this.cdr.markForCheck();

      // Start visualization for the system audio
      this.audioService.startSystemAudioVisualization(audio);

      // Play the audio
      await audio.play();

      // Handle completion
      audio.onended = async () => {
        this.isSystemSpeaking = false;
        this.onSpeakingComplete();
      };
    } catch (error) {
      console.error('TTS Error:', error);
      this.isSystemSpeaking = false;
      this.transcriptText = 'Error generating speech (ElevenLabs). Using system fallback.';
      await this.speakWithSystem(text); // Fallback
    }
  }

  private async speakWithSystem(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const settings = this.voiceSettingsService.getSettings();

      if (settings.systemVoiceName && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === settings.systemVoiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Emulate visualization (simple state change)
      utterance.onstart = () => {
        // Mark system as speaking
        this.isSystemSpeaking = true;
        this.currentMode = 'sphere'; // Show sphere visualization
        this.cdr.markForCheck();

        // Start visualization for system TTS
        this.audioService.startSpeechSynthesisVisualization();
      };

      utterance.onend = () => {
        this.isSystemSpeaking = false;
        this.audioService.stopSpeechSynthesisVisualization();
        this.onSpeakingComplete();
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('System TTS Error', e);
        this.isSystemSpeaking = false;
        this.audioService.stopSpeechSynthesisVisualization();
        this.onSpeakingComplete();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  private async onSpeakingComplete(): Promise<void> {
    // Stop system audio visualization (if any)
    this.audioService.stopAudioVisualization();

    // Resume microphone visualization and listening if we are still in "session" mode
    if (this.isListening) {
      this.systemText = '🎤 LISTENING...';

      // Restart recognition
      this.speechService.startListening();
      await this.audioService.startMicrophoneVisualization();
    } else {
      this.resetStates();
    }
    this.cdr.markForCheck();
  }

  private loadVoices() {
    const synth = window.speechSynthesis;

    const load = () => {
      this.voices = synth.getVoices();

      // Optional: auto select first voice
      if (this.voices.length > 0) {
        this.selectedVoice = this.voices[0];
      }

      console.log("Voices loaded:", this.voices);
    };

    load();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = load;
    }
  }

  onHeartClick(): void {
    if (this.isHeartMode) {
      this.resetStates();
      return;
    }

    this.resetStates();
    this.isHeartMode = true;
    this.currentMode = 'heart';
    this.systemText = 'LOVE MODE ENGAGED';
    this.cdr.markForCheck();
  }

  onEmojiClick(): void {
    if (this.isEmojiMode) {
      this.resetStates();
      return;
    }

    this.resetStates();
    this.isEmojiMode = true;
    this.currentMode = 'emoji';
    this.systemText = 'EMOTION ENGINE: HAPPY';
    this.cdr.markForCheck();
  }

  onChatToggle(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  onChatClose(): void {
    this.isChatOpen = false;
  }

  private resetStates(): void {
    this.isListening = false;
    this.isHeartMode = false;
    this.isEmojiMode = false;
    this.currentMode = 'sphere';
    this.showTranscript = false;
    this.systemText = this.isAudioActive ? 'AUDIO REACTIVE MODE' : 'SYSTEM ONLINE';
    this.cdr.markForCheck();
  }
}
