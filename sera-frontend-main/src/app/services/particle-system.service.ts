import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';
import { AudioVisualizationService, AudioData } from './audio-visualization.service';
import { Subject, takeUntil } from 'rxjs';

declare const THREE: any;
declare const anime: any;

export type VisualizationMode = 'sphere' | 'heart' | 'wave' | 'emoji';
export type EmotionState = 'happy' | 'sad' | 'surprised';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface SphereBase {
  ux: number;
  uy: number;
  uz: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParticleSystemService {
  private scene: any;
  private camera: any;
  private renderer: any;
  private particleSystem: any;

  private mouseX = 0;
  private mouseY = 0;
  private windowHalfX = window.innerWidth / 2;
  private windowHalfY = window.innerHeight / 2;

  private time = 0;
  private animationFrameId: number | null = null;

  // Particle data
  private readonly particleCount = 5000;
  private sphereBasePositions: SphereBase[] = [];
  private heartPositions: Position[] = [];
  private wavePositions: Position[] = [];
  private happyPositions: Position[] = [];
  private sadPositions: Position[] = [];
  private surprisedPositions: Position[] = [];
  private currentPositions: Position[] = [];

  // Animation Control
  private animState = {
    colorH: 180, // Cyan hue
    scale: 1
  };

  // Colors for custom particles
  private colorsAttribute: number[] = [];

  // State
  private currentMode: VisualizationMode = 'sphere';
  private currentEmotion: EmotionState = 'happy';
  private lastEmotionSwitch = 0;

  // Audio visualization
  private audioData: AudioData | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private audioService: AudioVisualizationService
  ) {
    // Subscribe to audio data
    this.audioService.audioData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.audioData = data;
      });
  }

  init(container: HTMLElement): void {
    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0005);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.z = 1000;

    // Generate particle positions
    this.generateParticlePositions();

    // Setup geometry
    const geometry = new THREE.BufferGeometry();
    const positionsArray = new Float32Array(this.particleCount * 3);
    const colorsArray = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount * 3; i++) {
      colorsArray[i] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Material
    const sprite = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png');
    const material = new THREE.PointsMaterial({
      size: 14,
      map: sprite,
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // Events
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start animation
    this.animate();
  }

  private generateParticlePositions(): void {
    const radius = 320;

    // SPHERE GENERATION
    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const ux = Math.sin(phi) * Math.cos(theta);
      const uy = Math.sin(phi) * Math.sin(theta);
      const uz = Math.cos(phi);

      const x = radius * ux;
      const y = radius * uy;
      const z = radius * uz;

      this.sphereBasePositions.push({ ux, uy, uz });
      this.currentPositions.push({ x, y, z });
    }

    // HEART GENERATION
    for (let i = 0; i < this.particleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = 15 * Math.sqrt(Math.random());

      let x = r * 16 * Math.pow(Math.sin(t), 3);
      let y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      let z = (Math.random() - 0.5) * 100 * (1 - Math.abs(y) / 300);

      x += (Math.random() - 0.5) * 15;
      y += (Math.random() - 0.5) * 15;
      z += (Math.random() - 0.5) * 15;

      this.heartPositions.push({ x, y: y + 40, z });
    }

    // WAVEFORM GENERATION
    for (let i = 0; i < this.particleCount; i++) {
      const width = 1400;
      const x = (i / this.particleCount) * width - (width / 2);
      const y = 0;
      const z = (Math.random() - 0.5) * 100;
      this.wavePositions.push({ x, y, z });
    }

    // EMOJI GENERATIONS
    this.generateEmojiPositions();
  }

  private generateEmojiPositions(): void {
    for (let i = 0; i < this.particleCount; i++) {
      let x: number, y: number, z: number;

      // HAPPY FACE
      if (i < 2000) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        x = 320 * Math.sin(phi) * Math.cos(theta);
        y = 320 * Math.sin(phi) * Math.sin(theta);
        z = 320 * Math.cos(phi);
      } else if (i < 3000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 30;
        x = -100 + r * Math.cos(angle);
        y = 50 + r * Math.sin(angle);
        z = 250;
      } else if (i < 4000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 30;
        x = 100 + r * Math.cos(angle);
        y = 50 + r * Math.sin(angle);
        z = 250;
      } else {
        const t = Math.random();
        const sx = (t - 0.5) * 200;
        const sy = -50 + (sx * sx) * 0.005;
        x = sx;
        y = sy;
        z = 250;
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
      }
      this.happyPositions.push({ x, y, z });

      // SAD FACE
      if (i < 2000) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        x = 320 * Math.sin(phi) * Math.cos(theta);
        y = 320 * Math.sin(phi) * Math.sin(theta);
        z = 320 * Math.cos(phi);
      } else if (i < 3000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 30;
        x = -100 + r * Math.cos(angle);
        y = 50 + r * Math.sin(angle);
        z = 250;
      } else if (i < 4000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 30;
        x = 100 + r * Math.cos(angle);
        y = 50 + r * Math.sin(angle);
        z = 250;
      } else {
        const t = Math.random();
        const sx = (t - 0.5) * 200;
        const sy = -100 - (sx * sx) * 0.005;
        x = sx;
        y = sy;
        z = 250;
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
      }
      this.sadPositions.push({ x, y, z });

      // SURPRISED FACE
      if (i < 2000) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        x = 320 * Math.sin(phi) * Math.cos(theta);
        y = 320 * Math.sin(phi) * Math.sin(theta);
        z = 320 * Math.cos(phi);
      } else if (i < 3000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 40;
        x = -100 + r * Math.cos(angle);
        y = 60 + r * Math.sin(angle);
        z = 250;
      } else if (i < 4000) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 40;
        x = 100 + r * Math.cos(angle);
        y = 60 + r * Math.sin(angle);
        z = 250;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 30 + 10;
        x = 0 + r * Math.cos(angle);
        y = -80 + r * Math.sin(angle);
        z = 250;
      }
      this.surprisedPositions.push({ x, y, z });
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.render();
  }

  private render(): void {
    const now = Date.now();
    this.time += 0.03;

    // Get theme hue dynamically
    let targetHue = this.themeService.getThemeHue();
    if (this.currentMode === 'emoji') targetHue = 45;

    // Audio reactivity - only if audio is actually active
    const audioBoost = (this.audioData && this.audioData.isActive) ? (this.audioData.volume / 100) * 3 : 0;
    const bassBoost = (this.audioData && this.audioData.isActive) ? (this.audioData.bassLevel / 100) * 4 : 0;
    const trebleBoost = (this.audioData && this.audioData.isActive) ? (this.audioData.trebleLevel / 100) * 3 : 0;
    const audioGlow = (this.audioData && this.audioData.isActive) ? Math.min(1, this.audioData.volume / 100) : 0;

    // Keep hue/saturation stable while speaking and increase glow through size/opacity
    // so the sphere doesn't wash out into a faded white.
    this.particleSystem.material.size = 14 + (audioGlow * 6) + (bassBoost * 0.8);
    this.particleSystem.material.opacity = Math.min(1, 0.9 + (audioGlow * 0.1));

    // Emotion cycling in emoji mode
    if (this.currentMode === 'emoji') {
      if (now - this.lastEmotionSwitch > 3000) {
        this.lastEmotionSwitch = now;
        if (this.currentEmotion === 'happy') this.currentEmotion = 'surprised';
        else if (this.currentEmotion === 'surprised') this.currentEmotion = 'sad';
        else this.currentEmotion = 'happy';
      }
    }

    // Select target positions
    let targetPosArray: Position[] | null = null;

    if (this.currentMode === 'wave') targetPosArray = this.wavePositions;
    else if (this.currentMode === 'emoji') {
      if (this.currentEmotion === 'happy') targetPosArray = this.happyPositions;
      else if (this.currentEmotion === 'sad') targetPosArray = this.sadPositions;
      else targetPosArray = this.surprisedPositions;
    } else if (this.currentMode === 'heart') targetPosArray = this.heartPositions;

    const positions = this.particleSystem.geometry.attributes.position.array;
    const colors = this.particleSystem.geometry.attributes.color.array;

    const radius = 300 + (bassBoost * 8); // Gentle bass pulse, no big expansion

    for (let i = 0; i < this.particleCount; i++) {
      const ix = i * 3;
      let tx: number, ty: number, tz: number;

      // Color logic: preserve rich color while speaking and avoid over-lightness fade
      const audioBrightness = Math.round(56 + (audioGlow * 10)); // 56%..66%
      const color = new THREE.Color(`hsl(${Math.round(targetHue)}, 100%, ${audioBrightness}%)`);

      if (this.currentMode === 'emoji' && i > 2000) {
        color.setHSL(0.12, 1.0, 0.9);
      }

      colors[ix] = color.r;
      colors[ix + 1] = color.g;
      colors[ix + 2] = color.b;

      // Position logic
      if (targetPosArray) {
        tx = targetPosArray[i].x;
        ty = targetPosArray[i].y;
        tz = targetPosArray[i].z;

        if (this.currentMode === 'wave') {
          const vx = targetPosArray[i].x;
          // Add flowing movement by shifting the phase with time
          const flowX = vx - (this.time * 50);
          const normX = (vx) / 700;
          const taper = Math.max(0, 1 - Math.abs(normX));

          // Gentle base animation (always present in wave mode)
          // Use flowX for the sine wave phase to make it travel
          const gentleWave = Math.sin(flowX * 0.005) * 20;
          const gentleJitter = Math.sin(flowX * 0.02 + this.time * 5) * 5;

          // Audio reactive amplification
          if (audioBoost > 0.005 || trebleBoost > 0.005 || bassBoost > 0.005) {
            // Strong audio reactive wave when speaking
            // Use frequency-based movement - higher frequency for more detail
            const audioWave = trebleBoost * 120 * Math.sin(flowX * 0.02);
            const volumeWave = audioBoost * 80 * Math.sin(flowX * 0.015 + this.time * 2);
            // Bass ripples through the wave
            const bassWave = bassBoost * 60 * Math.sin(flowX * 0.03 + this.time * 4);

            ty += (gentleWave + gentleJitter + audioWave + volumeWave + bassWave) * taper;
          } else {
            // Just gentle animation when no audio
            ty += (gentleWave + gentleJitter) * taper;
          }
        } else if (this.currentMode === 'emoji') {
          tx += Math.sin(this.time * 5) * 2;
          // Audio makes emoji bounce
          ty += Math.sin(this.time * 10) * audioBoost * 5;
        } else if (this.currentMode === 'heart') {
          // Heart beats with bass
          const heartBeat = 1 + (bassBoost * 0.1);
          tx *= heartBeat;
          ty *= heartBeat;
          tz *= heartBeat;
        }

        this.currentPositions[i].x += (tx - this.currentPositions[i].x) * 0.08;
        this.currentPositions[i].y += (ty - this.currentPositions[i].y) * 0.08;
        this.currentPositions[i].z += (tz - this.currentPositions[i].z) * 0.08;
      } else {
        // Procedural Sphere with quick, responsive audio amplitude
        const u = this.sphereBasePositions[i];

        // Faster, more responsive base animation
        const noise =
          Math.sin(u.ux * 3 + this.time * 1.5) * Math.cos(u.uy * 2 + this.time * 1) * 8 +
          Math.sin(u.uz * 4 - this.time * 1.2) * 8;

        // Gentle wobble for organic feel (speaking: surface ripples, not size change)
        const wobble = Math.sin(this.time * 3 + u.uy * 5) * (5 + bassBoost * 2);

        // Very subtle overall pulse — keeps sphere near base size
        const quickAudioResponse = audioBoost * 5;  // Tiny breath effect

        // Surface ripple details from treble & bass — creates speaking texture
        const trebleRipple = trebleBoost * 12 * Math.sin(this.time * 14 + u.ux * 6 + u.uy * 4);
        const bassWave = bassBoost * 6 * Math.cos(this.time * 8 + u.uy * 3);

        const rCurrent = radius + noise + wobble + quickAudioResponse + trebleRipple + bassWave;

        tx = u.ux * rCurrent;
        ty = u.uy * rCurrent;
        tz = u.uz * rCurrent;

        // Faster lerp for quick response (reduced from 0.1 to 0.15+)
        this.currentPositions[i].x += (tx - this.currentPositions[i].x) * 0.15;
        this.currentPositions[i].y += (ty - this.currentPositions[i].y) * 0.15;
        this.currentPositions[i].z += (tz - this.currentPositions[i].z) * 0.1;
      }

      positions[ix] = this.currentPositions[i].x;
      positions[ix + 1] = this.currentPositions[i].y;
      positions[ix + 2] = this.currentPositions[i].z;
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.color.needsUpdate = true;

    // Rotation
    if (this.currentMode === 'emoji') {
      this.particleSystem.rotation.y += (this.mouseX * 0.005 - this.particleSystem.rotation.y) * 0.1;
      this.particleSystem.rotation.z += (0 - this.particleSystem.rotation.z) * 0.1;
    } else if (this.currentMode !== 'wave') {
      this.particleSystem.rotation.y += 0.006;
      this.particleSystem.rotation.z = Math.sin(this.time * 0.5) * 0.05;
    } else {
      this.particleSystem.rotation.y += (0 - this.particleSystem.rotation.y) * 0.1;
      this.particleSystem.rotation.z += (0 - this.particleSystem.rotation.z) * 0.1;
    }

    this.particleSystem.scale.setScalar(this.animState.scale);

    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  setMode(mode: VisualizationMode): void {
    this.currentMode = mode;

    const themeHue = this.themeService.getThemeHue();

    if (mode === 'heart') {
      // Use secondary color hue for heart (warmer)
      const theme = this.themeService.getCurrentTheme();
      const heartHue = theme.name === 'future' ? 340 : themeHue - 20;
      anime({ targets: this.animState, colorH: heartHue, duration: 1000, easing: 'linear' });
    } else if (mode === 'emoji') {
      this.currentEmotion = 'happy';
      this.lastEmotionSwitch = Date.now();
      anime({ targets: this.animState, colorH: 45, duration: 1000, easing: 'linear' });
    } else if (mode === 'wave') {
      anime({ targets: this.animState, colorH: themeHue, scale: 1, duration: 800, easing: 'spring(1, 80, 10, 0)' });
    } else {
      anime({ targets: this.animState, colorH: themeHue, scale: 1, duration: 800 });
    }
  }

  getCurrentEmotion(): EmotionState {
    return this.currentEmotion;
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX - this.windowHalfX) * 0.1;
    this.mouseY = (event.clientY - this.windowHalfY) * 0.1;
  }

  private onWindowResize(): void {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
