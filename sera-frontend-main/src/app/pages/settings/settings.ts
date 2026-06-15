import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, Theme } from '../../services/theme.service';
import { VoiceSettingsService, VoiceType } from '../../services/voice-settings.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';

export interface SpeechLanguage {
  code: string;   // BCP-47 tag
  name: string;   // English name
  native: string; // Native name
  flag: string;   // Emoji flag
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  themes: Theme[] = [];
  currentTheme: Theme | null = null;
  currentVoiceType: VoiceType = 'system';
  availableVoices: SpeechSynthesisVoice[] = [];
  selectedSystemVoiceName = '';
  selectedSpeechLang = 'en-IN';

  // All languages supported by the Web Speech API (SpeechRecognition)
  speechLanguages: SpeechLanguage[] = [
    // English variants
    { code: 'en-IN', name: 'English (India)', native: 'English (India)', flag: '🇮🇳' },
    { code: 'en-US', name: 'English (US)', native: 'English (United States)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', native: 'English (United Kingdom)', flag: '🇬🇧' },
    { code: 'en-AU', name: 'English (Australia)', native: 'English (Australia)', flag: '🇦🇺' },
    { code: 'en-CA', name: 'English (Canada)', native: 'English (Canada)', flag: '🇨🇦' },
    { code: 'en-NZ', name: 'English (New Zealand)', native: 'English (New Zealand)', flag: '🇳🇿' },
    { code: 'en-ZA', name: 'English (South Africa)', native: 'English (South Africa)', flag: '🇿🇦' },
    // Indian languages
    { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali (India)', native: 'বাংলা (ভারত)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi (India)', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ur-IN', name: 'Urdu (India)', native: 'اردو (بھارت)', flag: '🇮🇳' },
    // East Asian
    { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文（简体）', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', native: '中文（繁體）', flag: '🇹🇼' },
    { code: 'zh-HK', name: 'Chinese (Hong Kong)', native: '中文（香港）', flag: '🇭🇰' },
    { code: 'ja-JP', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', native: '한국어', flag: '🇰🇷' },
    // European
    { code: 'fr-FR', name: 'French (France)', native: 'Français (France)', flag: '🇫🇷' },
    { code: 'fr-CA', name: 'French (Canada)', native: 'Français (Canada)', flag: '🇨🇦' },
    { code: 'de-DE', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'es-ES', name: 'Spanish (Spain)', native: 'Español (España)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', native: 'Español (México)', flag: '🇲🇽' },
    { code: 'es-US', name: 'Spanish (US)', native: 'Español (EE.UU.)', flag: '🇺🇸' },
    { code: 'it-IT', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', native: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)', native: 'Português (Portugal)', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { code: 'nl-NL', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl-PL', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
    { code: 'sv-SE', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
    { code: 'da-DK', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
    { code: 'fi-FI', name: 'Finnish', native: 'Suomi', flag: '🇫🇮' },
    { code: 'nb-NO', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴' },
    { code: 'cs-CZ', name: 'Czech', native: 'Čeština', flag: '🇨🇿' },
    { code: 'sk-SK', name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰' },
    { code: 'hu-HU', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺' },
    { code: 'ro-RO', name: 'Romanian', native: 'Română', flag: '🇷🇴' },
    { code: 'tr-TR', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { code: 'uk-UA', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
    { code: 'el-GR', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'hr-HR', name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷' },
    { code: 'bg-BG', name: 'Bulgarian', native: 'Български', flag: '🇧🇬' },
    // Middle East / Central Asia
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', native: 'العربية (السعودية)', flag: '🇸🇦' },
    { code: 'ar-EG', name: 'Arabic (Egypt)', native: 'العربية (مصر)', flag: '🇪🇬' },
    { code: 'he-IL', name: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
    { code: 'fa-IR', name: 'Persian', native: 'فارسی', flag: '🇮🇷' },
    // South East Asia
    { code: 'id-ID', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms-MY', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'th-TH', name: 'Thai', native: 'ภาษาไทย', flag: '🇹🇭' },
    { code: 'vi-VN', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'fil-PH', name: 'Filipino', native: 'Filipino', flag: '🇵🇭' },
    // Africa
    { code: 'sw-KE', name: 'Swahili (Kenya)', native: 'Kiswahili (Kenya)', flag: '🇰🇪' },
    { code: 'af-ZA', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦' },
    // Other
    { code: 'ca-ES', name: 'Catalan', native: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    { code: 'eu-ES', name: 'Basque', native: 'Euskara', flag: '🏴' },
    { code: 'gl-ES', name: 'Galician', native: 'Galego', flag: '🏴' },
    { code: 'lv-LV', name: 'Latvian', native: 'Latviešu', flag: '🇱🇻' },
    { code: 'lt-LT', name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹' },
    { code: 'et-EE', name: 'Estonian', native: 'Eesti', flag: '🇪🇪' },
    { code: 'sl-SI', name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮' },
    { code: 'sr-RS', name: 'Serbian', native: 'Српски', flag: '🇷🇸' },
  ];

  constructor(
    private themeService: ThemeService,
    private voiceSettingsService: VoiceSettingsService,
    private speechService: SpeechRecognitionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.themes = this.themeService.getAllThemes();

    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });

    // Subscribe to voice settings
    this.voiceSettingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.currentVoiceType = settings.type;
        this.selectedSystemVoiceName = settings.systemVoiceName || '';
        this.selectedSpeechLang = settings.speechLanguage || 'en-IN';
        this.loadAvailableVoices();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTheme(themeName: string): void {
    this.themeService.setTheme(themeName as any);
  }

  selectVoiceType(type: VoiceType): void {
    this.voiceSettingsService.setVoiceType(type);
  }

  selectSystemVoice(name: string): void {
    this.selectedSystemVoiceName = name;
    this.voiceSettingsService.setSystemVoiceName(name);
  }

  selectSpeechLanguage(code: string): void {
    this.selectedSpeechLang = code;
    this.voiceSettingsService.setSpeechLanguage(code);
    this.speechService.setLanguage(code);
  }

  isActiveTheme(themeName: string): boolean {
    return this.currentTheme?.name === themeName;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  loadAvailableVoices(): void {
    const voices = this.getSystemVoices();
    if (voices.length === 0 && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.availableVoices = this.getSystemVoices();
        this.ensureDefaultSystemVoice();
      };
      return;
    }

    this.availableVoices = voices;
    this.ensureDefaultSystemVoice();
  }

  getSystemVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    return window.speechSynthesis
      .getVoices()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private ensureDefaultSystemVoice(): void {
    if (!this.selectedSystemVoiceName && this.availableVoices.length > 0) {
      const defaultVoice = this.availableVoices[0];
      this.selectSystemVoice(defaultVoice.name);
    }
  }
}

