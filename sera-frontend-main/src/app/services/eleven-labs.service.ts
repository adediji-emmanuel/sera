import { Injectable } from '@angular/core';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

@Injectable({
    providedIn: 'root'
})
export class ElevenLabsService {
    private client: ElevenLabsClient;
    private apiKey = '3ad625e5fec02011f9eb9ed74799179ddcea55aff1b0b27dc49866c043d8c922'; // REQUIRED: Replace with your actual API key

    constructor() {
        this.client = new ElevenLabsClient({
            apiKey: this.apiKey
        });
    }

    async generateSpeech(text: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL'): Promise<string> {
        try {
            if (!this.apiKey) {
                console.error('ElevenLabs API Key not configured. Please set it in ElevenLabsService.');
                throw new Error('API Key missing');
            }

            const audioStream = await this.client.textToSpeech.convert(voiceId, {
                text,
                modelId: 'eleven_multilingual_v2',
                voiceSettings: {
                    stability: 0.5,
                    similarityBoost: 0.75,
                }
            });

            // Convert stream to blob
            const chunks: any[] = [];
            const reader = (audioStream as any).getReader ? (audioStream as any).getReader() : null;

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
            } else {
                // Fallback or if already array/buffer
                // In some browser environments it might return differently, handling widely
                chunks.push(audioStream);
            }

            const blob = new Blob(chunks, { type: 'audio/mpeg' });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error generating speech:', error);
            throw error;
        }
    }
}
