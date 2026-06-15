# 🎯 Quick Start Guide

## Component Directory

### 🔘 Generic Button Component
**Location:** `src/app/components/control-button/control-button.component.ts`

**Usage Examples:**

```typescript
// Standard button
<app-control-button
  iconClass="fas fa-star"
  title="Star Mode"
  (buttonClick)="onStarClick()"
/>

// Active state with variant
<app-control-button
  iconClass="fas fa-heart"
  title="Love Mode"
  [isActive]="true"
  activeClass="heart"
  (buttonClick)="onHeartClick()"
/>

// Microphone button (larger)
<app-control-button
  iconClass="fas fa-microphone"
  title="Voice Input"
  [isActive]="isMicActive"
  [isMicButton]="true"
  (buttonClick)="onMicClick()"
/>
```

**Properties:**
- `iconClass: string` - Font Awesome class (e.g., "fas fa-heart")
- `title: string` - Tooltip text
- `isActive: boolean` - Active state
- `isMicButton: boolean` - Use larger mic styling
- `activeClass: 'heart' | 'emoji' | 'chat' | ''` - Active variant style
- `(buttonClick)` - Click event emitter

## Adding New Features

### 1. Add a New Visualization Mode

**Step 1:** Update the type in `particle-system.service.ts`:
```typescript
export type VisualizationMode = 'sphere' | 'heart' | 'wave' | 'emoji' | 'star';
```

**Step 2:** Generate particle positions (add to `generateParticlePositions()`):
```typescript
private starPositions: Position[] = [];

// In generateParticlePositions():
for (let i = 0; i < this.particleCount; i++) {
  // Your star shape logic
  this.starPositions.push({ x, y, z });
}
```

**Step 3:** Add render logic (in `render()` method):
```typescript
if (this.currentMode === 'star') {
  targetPosArray = this.starPositions;
}
```

**Step 4:** Use in home component:
```typescript
onStarClick() {
  this.currentMode = 'star';
}
```

### 2. Add a New Button to Side Dock

**Edit:** `src/app/components/side-dock/side-dock.component.ts`

```typescript
// Add input
@Input() isStarActive = false;

// Add output
@Output() starClick = new EventEmitter<void>();

// Add to template
<app-control-button
  iconClass="fas fa-star"
  title="Star Mode"
  [isActive]="isStarActive"
  (buttonClick)="starClick.emit()"
/>
```

**Use in home:**
```typescript
// Template
<app-side-dock
  [isStarActive]="isStarMode"
  (starClick)="onStarClick()"
/>

// Component
isStarMode = false;

onStarClick() {
  this.resetStates();
  this.isStarMode = true;
  this.currentMode = 'star';
  this.systemText = 'STAR MODE';
}
```

### 3. Customize Chat Panel

**Edit:** `src/app/components/chat-panel/chat-panel.component.ts`

```typescript
// Add more simulated responses
private simulateResponse(): void {
  const responses = [
    "Your custom response 1",
    "Your custom response 2",
    "Another response",
  ];
  // ... rest of logic
}

// Change initial message
messages: ChatMessage[] = [
  {
    content: 'Your custom welcome message',
    sender: 'ai'
  }
];
```

## Component Relationships

```
┌─────────────────────────────────────────┐
│         Home Component                   │
│  (Orchestrates everything)               │
└────┬────────────────────────────────┬───┘
     │                                 │
     ├─→ ParticleCanvas               ├─→ ClockService
     │   └─→ ParticleSystemService    │   (Observable)
     │                                 │
     ├─→ HudHeader                     │
     ├─→ ChatPanel                     │
     ├─→ SideDock                      │
     │   └─→ ControlButton (×3)        │
     └─→ ControlsDock                  │
         └─→ ControlButton (×1)        │
```

## Styling Customization

### Change Colors

**Edit:** `src/app/pages/home/home.css`

```css
:host {
  --primary-color: #00f3ff;     /* Change to your color */
  --secondary-color: #ff0055;   /* Change to your color */
  --gold-color: #ffd700;        /* Change to your color */
}
```

### Adjust Particle Count

**Edit:** `src/app/services/particle-system.service.ts`

```typescript
private readonly particleCount = 5000; // Change number
```

### Modify Animation Speed

**In particle-system.service.ts:**

```typescript
// Rotation speed
this.particleSystem.rotation.y += 0.006; // Change value

// Time increment (overall animation speed)
this.time += 0.03; // Change value
```

## Testing the App

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

## File Quick Reference

| File | Purpose |
|------|---------|
| `services/particle-system.service.ts` | 3D particle engine |
| `services/clock.service.ts` | Time updates |
| `components/control-button/` | Generic button ⭐ |
| `components/chat-panel/` | Chat interface |
| `components/particle-canvas/` | 3D container |
| `pages/home/` | Main page |
| `src/index.html` | External libraries |
| `src/styles.css` | Global styles |

## Common Tasks

### Change Weather Location

**Edit:** `src/app/components/hud-header/hud-header.component.ts`

```typescript
<div>NAGPUR, IN</div>  // Change this
<i class="fas fa-cloud-sun"></i> 28°C  // Change this
```

### Add More Emotions (Emoji Mode)

**Edit:** `src/app/services/particle-system.service.ts`

```typescript
export type EmotionState = 'happy' | 'sad' | 'surprised' | 'angry';

// Add generation logic in generateEmojiPositions()
private angryPositions: Position[] = [];

// Add to emotion cycling
if (this.currentEmotion === 'surprised') this.currentEmotion = 'angry';
```

## Tips & Tricks

1. **Performance**: Reduce `particleCount` if running slow
2. **Debugging**: Use browser DevTools for Three.js inspector
3. **Fonts**: All icons from Font Awesome 6.4 work
4. **Responsiveness**: Components handle mobile automatically
5. **Particles**: Use `setMode()` to change visualization anytime

## Support Files

- 📖 [ARCHITECTURE.md](ARCHITECTURE.md) - Full technical details
- 📝 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Overview
- 📘 [README.md](README.md) - Project readme

---

**Happy Coding! 🚀**
