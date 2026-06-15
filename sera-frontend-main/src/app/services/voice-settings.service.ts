import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type VoiceType = 'system' | 'eleven-labs';

export interface VoiceSettings {
    type: VoiceType;
    elevenLabsVoiceId: string;
    systemVoiceName: string;
    speechLanguage: string;  // BCP-47 language tag for Speech-to-Text, e.g. 'en-IN'
}

@Injectable({
    providedIn: 'root'
})
export class VoiceSettingsService {
    private settingsSubject = new BehaviorSubject<VoiceSettings>({
        type: 'eleven-labs',
        elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Default ID
        systemVoiceName: '',
        speechLanguage: 'en-IN'
    });

    public settings$ = this.settingsSubject.asObservable();

    constructor() {
        // Load from local storage if available
        const saved = localStorage.getItem('voice_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrate old settings that don't have speechLanguage yet
                if (!parsed.speechLanguage) {
                    parsed.speechLanguage = 'en-IN';
                }
                this.settingsSubject.next(parsed);
            } catch (e) {
                console.error('Failed to parse saved voice settings', e);
            }
        }
    }

    setVoiceType(type: VoiceType): void {
        const current = this.settingsSubject.value;
        const newSettings = { ...current, type };
        this.settingsSubject.next(newSettings);
        this.saveSettings(newSettings);
    }

    setElevenLabsVoiceId(id: string): void {
        const current = this.settingsSubject.value;
        const newSettings = { ...current, elevenLabsVoiceId: id };
        this.settingsSubject.next(newSettings);
        this.saveSettings(newSettings);
    }

    setSystemVoiceName(name: string): void {
        const current = this.settingsSubject.value;
        const newSettings = { ...current, systemVoiceName: name };
        this.settingsSubject.next(newSettings);
        this.saveSettings(newSettings);
    }

    setSpeechLanguage(lang: string): void {
        const current = this.settingsSubject.value;
        const newSettings = { ...current, speechLanguage: lang };
        this.settingsSubject.next(newSettings);
        this.saveSettings(newSettings);
    }

    updateVoiceType(type: VoiceType): void {
        this.settingsSubject.next({ ...this.settingsSubject.value, type });
    }

    getSettings(): VoiceSettings {
        return this.settingsSubject.value;
    }

    private saveSettings(settings: VoiceSettings): void {
        localStorage.setItem('voice_settings', JSON.stringify(settings));
    }
}
