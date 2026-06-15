export interface IntentRequest {
    text: string;
}
export interface IntentResponse {
    intent: string;
    entities?: {
        [key: string]: any;
    };
    confidence: number;
}