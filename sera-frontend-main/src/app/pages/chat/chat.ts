import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare const marked: any;

interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
  isImage?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  messages: ChatMessage[] = [
    {
      content: 'Hi! I\'m SERA. Ask me anything, or describe the task you want to solve.',
      sender: 'ai'
    }
  ];

  inputText = '';

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  startNewChat(): void {
    this.messages = [
      {
        content: 'New chat started. How can I help you today?',
        sender: 'ai'
      }
    ];
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text) {
      return;
    }

    this.messages.push({ content: text, sender: 'user' });
    this.inputText = '';
    this.simulateResponse();
    this.scrollToBottom();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
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
        'Here\'s a quick summary and next steps you can take.',
        'I can help with that. Do you want a short answer or a full walkthrough?',
        'Understood. I\'ll draft a plan and a starting solution.',
        'Got it. I\'ll stay in context and keep the response concise.'
      ];
      const randomResp = responses[Math.floor(Math.random() * responses.length)];
      this.messages.push({ content: randomResp, sender: 'ai' });
      this.scrollToBottom();
    }, 800 + Math.random() * 800);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-thread');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
