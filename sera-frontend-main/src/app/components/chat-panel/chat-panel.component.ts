import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const marked: any;

export interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
  isImage?: boolean;
}

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-panel" [class.open]="isOpen">
      <div class="chat-header">
        <div class="chat-title">
          <i class="fas fa-terminal"></i> SECURE CHAT
        </div>
        <div class="close-chat-btn" (click)="onClose()">
          <i class="fas fa-times"></i>
        </div>
      </div>
      
      <div class="chat-messages" #chatMessages>
        <div 
          *ngFor="let message of messages" 
          class="message" 
          [class.user]="message.sender === 'user'"
          [class.ai]="message.sender === 'ai'"
        >
          <ng-container *ngIf="!message.isImage">
            <div [innerHTML]="parseMarkdown(message.content)"></div>
          </ng-container>
          <ng-container *ngIf="message.isImage">
            <img [src]="message.content" alt="Uploaded image" />
          </ng-container>
        </div>
      </div>
      
      <div class="chat-input-area">
        <input 
          type="file" 
          #fileInput 
          accept="image/*" 
          style="display: none;"
          (change)="onFileSelected($event)"
        >
        <button class="chat-action-btn" (click)="fileInput.click()" title="Upload Image">
          <i class="fas fa-paperclip"></i>
        </button>
        <input 
          type="text" 
          class="chat-input" 
          [(ngModel)]="inputText"
          (keypress)="onKeyPress($event)"
          placeholder="Enter command..."
        >
        <button class="chat-action-btn" (click)="sendMessage()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      background: rgba(5, 10, 15, 0.85);
      backdrop-filter: blur(20px);
      border-left: 1px solid var(--glass-border);
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      z-index: 100;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
    }

    .chat-panel.open {
      transform: translateX(0);
    }

    .chat-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--chat-user-bg);
    }

    .chat-title {
      font-family: 'Share Tech Mono', monospace;
      color: var(--primary-color);
      letter-spacing: 2px;
      font-size: 1.1rem;
    }

    .close-chat-btn {
      cursor: pointer;
      color: var(--text-color);
      font-size: 1.2rem;
      opacity: 0.7;
      transition: 0.2s;
    }
    
    .close-chat-btn:hover { 
      opacity: 1; 
      color: var(--secondary-color); 
    }

    .chat-messages {
      flex-grow: 1;
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 85%;
      padding: 0.8rem 1rem;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.5;
      position: relative;
      animation: popIn 0.3s ease-out forwards;
      word-wrap: break-word;
    }

    @keyframes popIn {
      0% { opacity: 0; transform: translateY(10px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .message.user {
      align-self: flex-end;
      background: var(--chat-user-bg);
      border: 1px solid var(--primary-color);
      border-bottom-right-radius: 2px;
      box-shadow: 0 0 10px var(--primary-color);
    }

    .message.ai {
      align-self: flex-start;
      background: var(--chat-ai-bg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom-left-radius: 2px;
      color: #ccc;
    }

    .message img {
      max-width: 100%;
      border-radius: 8px;
      margin-top: 5px;
      border: 1px solid var(--glass-border);
    }

    .message :deep(code) {
      background: rgba(0,0,0,0.5);
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'Share Tech Mono', monospace;
      color: var(--accent-color);
    }

    .message :deep(pre) {
      background: rgba(0,0,0,0.5);
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .message :deep(p) { 
      margin: 0 0 5px 0; 
    }
    
    .message :deep(p:last-child) { 
      margin: 0; 
    }

    .chat-input-area {
      padding: 1.5rem;
      border-top: 1px solid var(--glass-border);
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.3);
      align-items: center;
    }

    .chat-input {
      flex-grow: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-color);
      padding: 10px 15px;
      border-radius: 20px;
      font-family: 'Rajdhani', sans-serif;
      font-size: 1rem;
      outline: none;
      transition: 0.3s;
    }

    .chat-input:focus {
      border-color: var(--primary-color);
      background: var(--chat-user-bg);
    }

    .chat-action-btn {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--primary-color);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.3s;
    }

    .chat-action-btn:hover {
      background: var(--primary-color);
      color: #000;
    }

    /* Scrollbar Styling */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 3px;
    }

    @media (max-width: 768px) {
      .chat-panel { 
        width: 100%; 
      }
    }
  `]
})
export class ChatPanelComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  messages: ChatMessage[] = [
    {
      content: '<strong>A.I. SYSTEM:</strong><br>Secure channel established. You can send text or upload visual data for analysis.',
      sender: 'ai'
    }
  ];

  inputText = '';

  onClose(): void {
    this.close.emit();
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (text) {
      this.messages.push({ content: text, sender: 'user' });
      this.inputText = '';
      this.simulateResponse();
      this.scrollToBottom();
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.messages.push({ content: result, sender: 'user', isImage: true });
        this.simulateResponse();
        this.scrollToBottom();
      };
      reader.readAsDataURL(file);
    }
  }

  parseMarkdown(content: string): string {
    if (typeof marked !== 'undefined') {
      return marked.parse(content);
    }
    return content;
  }

  private simulateResponse(): void {
    setTimeout(() => {
      const responses = [
        "Processing data...",
        "I can see that clearly.",
        "Here is a summary of the analysis: \n\n* **Confidence:** 98%\n* **Type:** Visual Data",
        "How else may I assist you?"
      ];
      const randomResp = responses[Math.floor(Math.random() * responses.length)];
      this.messages.push({ content: randomResp, sender: 'ai' });
      this.scrollToBottom();
    }, 1000 + Math.random() * 1000);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
