# 🗺️ Component Map

## Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ HUD HEADER                                              │  │
│  │  • System Status                                        │  │
│  │  • Clock (12:00)                                        │  │
│  │  • Weather Widget                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──┐                                              ┌─────────┐ │
│  │💬│  SIDE DOCK                                   │ CHAT    │ │
│  │😊│  (Left Side)                                 │ PANEL   │ │
│  │❤️│                                               │ (Slide  │ │
│  └──┘                                              │  -in)   │ │
│                                                    └─────────┘ │
│                                                                │
│              ┌─────────────────────────┐                       │
│              │ PARTICLE CANVAS         │                       │
│              │ (3D Background)         │                       │
│              │  - Sphere Mode          │                       │
│              │  - Heart Mode           │                       │
│              │  - Wave Mode            │                       │
│              │  - Emoji Mode           │                       │
│              └─────────────────────────┘                       │
│                                                                │
│                   ┌──────────────────┐                         │
│                   │ TRANSCRIPT BOX   │                         │
│                   │ "Listening..."   │                         │
│                   └──────────────────┘                         │
│                                                                │
│                        ────────                                │
│                         🎤                                     │
│                    CONTROLS DOCK                               │
│                    (Bottom Center)                             │
└────────────────────────────────────────────────────────────────┘
```

## Component Tree

```
Home Component
├── ParticleCanvasComponent
│   └── ParticleSystemService
│       ├── Sphere Positions (5000)
│       ├── Heart Positions (5000)
│       ├── Wave Positions (5000)
│       └── Emoji Positions (3 sets of 5000)
│
├── HudHeaderComponent
│   └── ClockService (Observable)
│
├── ChatPanelComponent
│   ├── Message List
│   ├── Image Upload
│   └── Text Input
│
├── SideDockComponent
│   ├── ControlButtonComponent (Chat)
│   ├── ControlButtonComponent (Emoji)
│   └── ControlButtonComponent (Heart)
│
└── ControlsDockComponent
    └── ControlButtonComponent (Mic - Large)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                          │
└───────────┬─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│               HOME COMPONENT                             │
│  • Manages all state                                     │
│  • Coordinates between components                        │
│  • Handles button clicks                                 │
└───┬─────────────────┬──────────────────┬────────────────┘
    │                 │                  │
    │                 │                  │
    ▼                 ▼                  ▼
┌────────┐     ┌──────────┐     ┌──────────────┐
│Particle│     │  Clock   │     │ UI Components│
│Service │     │ Service  │     │ (Buttons,    │
│        │     │          │     │  Chat, etc)  │
└────┬───┘     └────┬─────┘     └──────┬───────┘
     │              │                   │
     │              │                   │
     ▼              ▼                   ▼
┌────────┐     ┌────────┐         ┌────────┐
│Three.js│     │RxJS    │         │ DOM    │
│Renderer│     │Timer   │         │Events  │
└────────┘     └────────┘         └────────┘
```

## State Management

```typescript
// Home Component State
{
  currentMode: 'sphere' | 'heart' | 'wave' | 'emoji',
  isChatOpen: boolean,
  isListening: boolean,
  isHeartMode: boolean,
  isEmojiMode: boolean,
  systemText: string,
  transcriptText: string,
  showTranscript: boolean,
  time: string,
  date: string
}
```

## Event Flow

```
User Clicks Mic Button
      ↓
SideDockComponent emits micClick
      ↓
Home.onMicClick() called
      ↓
┌─────────────────────────────┐
│ • Reset all states          │
│ • Set isListening = true    │
│ • Set currentMode = 'wave'  │
│ • Update systemText         │
│ • Show transcript           │
└─────────────────────────────┘
      ↓
ParticleCanvas receives [mode]="wave"
      ↓
ParticleSystemService.setMode('wave')
      ↓
Particles morph to waveform
```

## Styling Layers

```
┌─────────────────────────────────────┐
│  Global (styles.css)                │
│   • Body reset                      │
│   • Scrollbar styling               │
│   • Font family                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Component Styles                   │
│   • CSS Variables                   │
│   • Glassmorphism                   │
│   • Animations                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Dynamic Classes                    │
│   • .active                         │
│   • .open                           │
│   • .heart-mode                     │
│   • .wave-mode                      │
│   • .emoji-mode                     │
└─────────────────────────────────────┘
```

## Component Communication

### Parent → Child (Input)
```
Home → ParticleCanvas: [mode]="currentMode"
Home → ChatPanel: [isOpen]="isChatOpen"
Home → HudHeader: [time]="time" [date]="date"
Home → SideDock: [isHeartActive]="isHeartMode"
```

### Child → Parent (Output)
```
SideDock → Home: (heartClick)="onHeartClick()"
ChatPanel → Home: (close)="onChatClose()"
ControlsDock → Home: (micClick)="onMicClick()"
```

### Service Injection
```
Home ← ClockService (Observable)
ParticleCanvas ← ParticleSystemService (Provider)
```

## Particle System Layers

```
┌─────────────────────────────────────────────┐
│  Canvas Container                            │
│  ┌───────────────────────────────────────┐  │
│  │ Three.js Scene                        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │ ParticleSystem (5000 points)    │  │  │
│  │  │  • Positions Buffer (x,y,z)     │  │  │
│  │  │  • Colors Buffer (r,g,b)        │  │  │
│  │  │  • Material (additive blending) │  │  │
│  │  │  • Sprite Texture               │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  Camera (Perspective)                 │  │
│  │  Fog (Exponential)                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Renderer (WebGL)                           │
└─────────────────────────────────────────────┘
```

## Button Variants

```
┌──────────────────────────────────────────────┐
│ ControlButtonComponent (Generic)             │
├──────────────────────────────────────────────┤
│                                              │
│  Default State        Active State          │
│  ┌──────────┐        ┌──────────┐          │
│  │   icon   │  →     │   ICON   │          │
│  └──────────┘        └──────────┘          │
│   50×50px             Glowing               │
│                                              │
│  Variants:                                   │
│  • activeClass=""     → Cyan glow           │
│  • activeClass="heart" → Pink glow          │
│  • activeClass="emoji" → Gold glow          │
│  • activeClass="chat"  → Cyan fill          │
│                                              │
│  Special:                                    │
│  • isMicButton=true   → 90×90px             │
│                                              │
└──────────────────────────────────────────────┘
```

## File Size Reference

```
Services:
├── particle-system.service.ts   ~16 KB
└── clock.service.ts              ~1 KB

Components:
├── control-button.component.ts   ~2 KB  ⭐ Most reusable
├── chat-panel.component.ts       ~7 KB
├── hud-header.component.ts       ~2 KB
├── controls-dock.component.ts    ~1 KB
├── side-dock.component.ts        ~2 KB
└── particle-canvas.component.ts  ~2 KB

Pages:
└── home/                         ~4 KB
```

## Quick Component Locator

Need to modify...

**Button appearance?** → `components/control-button/`
**Chat messages?** → `components/chat-panel/`
**Time display?** → `components/hud-header/` or `services/clock.service.ts`
**Particle shapes?** → `services/particle-system.service.ts`
**Overall layout?** → `pages/home/`
**Colors/theme?** → Any component's CSS (uses CSS variables)

---

**Navigation Tip:** Use VS Code's "Go to Definition" (F12) to jump between components!
