import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlButtonComponent } from '../control-button/control-button.component';

@Component({
  selector: 'app-controls-dock',
  standalone: true,
  imports: [CommonModule, FormsModule, ControlButtonComponent],
  template: `
    <div class="controls-dock">
      <div class="input-container">
        <input 
          type="text" 
          class="glass-input" 
          placeholder="Ask anything..." 
          [(ngModel)]="inputText"
          (keydown.enter)="onSend()"
        >
        <button class="send-btn" [class.visible]="inputText.length > 0" (click)="onSend()">
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>

      <app-control-button
        [iconClass]="isMicActive ? 'fas fa-stop' : 'fas fa-microphone'"
        [title]="isMicActive ? 'Stop Listening' : 'Start Listening'"
        [isActive]="isMicActive"
        (buttonClick)="micClick.emit()"
      />
    </div>
  `,
  styles: [`
    .controls-dock {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 2rem;
      pointer-events: auto;
      position: relative;
      width: 100%;
      gap: 1.5rem;
    }

    .controls-dock::before {
      content: '';
      position: absolute;
      top: -20px;
      width: 60%;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
      opacity: 0.3;
    }

    .input-container {
      position: relative;
      width: 400px;
      max-width: 50vw;
      height: 50px;
      display: flex;
      align-items: center;
    }

    .glass-input {
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 30, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 25px;
      padding: 0 45px 0 20px;
      color: var(--text-color);
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      backdrop-filter: blur(10px);
      outline: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .glass-input:focus {
      background: rgba(30, 30, 45, 0.8);
      border-color: var(--primary-color);
      box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.3);
    }

    .glass-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .send-btn {
      position: absolute;
      right: 5px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--primary-color);
      color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none;
    }

    .send-btn.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    .send-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px var(--primary-color);
    }

    /* Adjust mic button margin if needed */
    app-control-button {
      flex-shrink: 0;
    }
  `]
})
export class ControlsDockComponent {
  @Input() isMicActive = false;
  @Output() micClick = new EventEmitter<void>();
  @Output() textSubmit = new EventEmitter<string>();

  inputText = '';

  onSend() {
    if (this.inputText.trim()) {
      this.textSubmit.emit(this.inputText);
      this.inputText = '';
    }
  }
}
