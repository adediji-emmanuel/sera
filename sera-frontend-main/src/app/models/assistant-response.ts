export interface AssistantResponse {
    intent: string;
    entities?: any;
    actionRequired: boolean;
    speakResponse?: string;
}
