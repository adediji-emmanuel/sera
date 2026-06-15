import { Component, OnInit, OnDestroy, OnChanges, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticleSystemService, VisualizationMode } from '../../services/particle-system.service';

@Component({
  selector: 'app-particle-canvas',
  standalone: true,
  imports: [CommonModule],
  providers: [ParticleSystemService],
  template: `
    <div 
      #canvasContainer 
      class="canvas-container"
      [class.heart-mode]="mode === 'heart'"
      [class.wave-mode]="mode === 'wave'"
      [class.emoji-mode]="mode === 'emoji'"
    ></div>
  `,
  styles: [`
    .canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background: radial-gradient(circle at center, #111 0%, #000 100%);
      filter: contrast(1.2) drop-shadow(0 0 20px var(--primary-color));
      transition: filter 0.5s ease;
    }

    .canvas-container.heart-mode {
      filter: contrast(1.2) drop-shadow(0 0 30px var(--secondary-color));
    }

    .canvas-container.wave-mode {
      filter: contrast(1.3) drop-shadow(0 0 40px var(--primary-color));
    }
    
    .canvas-container.emoji-mode {
      filter: contrast(1.3) drop-shadow(0 0 35px var(--accent-color));
    }
  `]
})
export class ParticleCanvasComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: VisualizationMode = 'sphere';

  constructor(
    private elementRef: ElementRef,
    private particleService: ParticleSystemService
  ) {}

  ngOnInit(): void {
    const container = this.elementRef.nativeElement.querySelector('.canvas-container');
    this.particleService.init(container);
  }

  ngOnChanges(): void {
    this.particleService.setMode(this.mode);
  }

  ngOnDestroy(): void {
    this.particleService.destroy();
  }
}
