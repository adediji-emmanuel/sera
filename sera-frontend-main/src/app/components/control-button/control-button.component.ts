import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="control-btn" 
      [class.mic-btn]="isMicButton"
      [class.active]="isActive && !activeClass"
      [class.active-heart]="isActive && activeClass === 'heart'"
      [class.active-emoji]="isActive && activeClass === 'emoji'"
      [class.active-chat]="isActive && activeClass === 'chat'"
      [attr.title]="title"
      (click)="onClick()"
    >
      <i [class]="iconClass"></i>
    </div>
  `,
  styles: [`
    .control-btn {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: var(--text-color);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      position: relative;
      z-index: 20;
    }

    .control-btn:hover {
      background: var(--chat-user-bg);
      box-shadow: 0 0 20px var(--primary-color);
      transform: translateY(-5px);
    }

    .control-btn.active {
      background: var(--chat-user-bg);
      border-color: var(--primary-color);
      color: var(--primary-color);
      box-shadow: 0 0 40px var(--primary-color);
    }

    .control-btn.active-heart {
      color: var(--secondary-color);
      border-color: var(--secondary-color);
      box-shadow: 0 0 20px var(--secondary-color);
    }
    
    .control-btn.active-emoji {
      color: var(--accent-color);
      border-color: var(--accent-color);
      box-shadow: 0 0 20px var(--accent-color);
    }

    .control-btn.active-chat {
      background: var(--primary-color);
      color: #000;
      box-shadow: 0 0 20px var(--primary-color);
    }

    .mic-btn {
      width: 90px;
      height: 90px;
      font-size: 2.2rem;
      border: 2px solid var(--primary-color);
      box-shadow: 0 0 25px var(--primary-color);
    }
  `]
})
export class ControlButtonComponent {
  @Input() iconClass = 'fas fa-circle';
  @Input() title = '';
  @Input() isActive = false;
  @Input() isMicButton = false;
  @Input() activeClass: 'heart' | 'emoji' | 'chat' | '' = '';
  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    this.buttonClick.emit();
  }
}
