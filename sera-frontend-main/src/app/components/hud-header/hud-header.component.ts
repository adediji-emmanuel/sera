import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hud-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud-header">
      <div class="status-block">
        <div class="system-status">
          <div class="status-dot"></div>
          <span>{{ systemText }}</span>
        </div>
        <div class="clock">{{ time }}</div>
        <div class="date">{{ date }}</div>
      </div>
      
      <div class="weather-widget">
        <div style="font-size: 0.8rem; color: var(--primary-color);">LOCATION</div>
        <div>NAGPUR, IN</div>
        <div style="font-size: 1.2rem; display: flex; align-items: center; gap: 10px; margin-top: 5px;">
          <i class="fas fa-cloud-sun"></i> 28°C
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 2rem;
      pointer-events: auto;
    }

    .status-block {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .system-status {
      font-family: 'Share Tech Mono', monospace;
      color: var(--primary-color);
      font-size: 0.9rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-color);
      opacity: 1;
    }

    .clock {
      font-size: 2rem;
      font-weight: 700;
      text-shadow: 0 0 20px var(--primary-color);
    }

    .date {
      font-size: 1rem;
      opacity: 0.7;
    }

    .weather-widget {
      text-align: right;
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--glass-border);
    }

    @media (max-width: 768px) {
      .weather-widget { 
        display: none; 
      }
    }
  `]
})
export class HudHeaderComponent {
  @Input() systemText = 'SYSTEM ONLINE';
  @Input() time = '00:00';
  @Input() date = 'JAN 01 2026';
}
