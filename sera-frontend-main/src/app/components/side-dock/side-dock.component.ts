import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ControlButtonComponent } from '../control-button/control-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-dock',
  standalone: true,
  imports: [ControlButtonComponent],
  template: `
    <div class="side-dock">
      <app-control-button
        iconClass="fas fa-message"
        title="Open Chat"
        [isActive]="isChatActive"
        activeClass="chat"
        (buttonClick)="chatClick.emit()"
      />

      <app-control-button
        iconClass="fas fa-comments"
        title="Chat Page"
        activeClass="chat"
        (buttonClick)="navigateToChat()"
      />
      
      <app-control-button
        iconClass="fas fa-face-smile"
        title="Emotion Mode"
        [isActive]="isEmojiActive"
        activeClass="emoji"
        (buttonClick)="emojiClick.emit()"
      />
      
      <app-control-button
        iconClass="fas fa-heart"
        title="Love Mode"
        [isActive]="isHeartActive"
        activeClass="heart"
        (buttonClick)="heartClick.emit()"
      />

      <div class="divider"></div>
      
      <app-control-button
        iconClass="fas fa-palette"
        title="Theme Settings"
        (buttonClick)="navigateToSettings()"
      />
    </div>
  `,
  styles: [`
    .side-dock {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      pointer-events: auto;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--primary-color, #00f3ff), transparent);
      opacity: 0.3;
      margin: 0.5rem 0;
    }

    @media (max-width: 768px) {
      .side-dock { 
        left: 10px; 
      }
    }
  `]
})
export class SideDockComponent {
  @Input() isChatActive = false;
  @Input() isEmojiActive = false;
  @Input() isHeartActive = false;
  
  @Output() chatClick = new EventEmitter<void>();
  @Output() emojiClick = new EventEmitter<void>();
  @Output() heartClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
