# A.I. Voice Assistant Interface - Angular Implementation

## Overview
This is a futuristic A.I. Voice Assistant Interface built with Angular 18+ and Three.js, featuring dynamic 3D particle visualizations that morph between different shapes (sphere, heart, waveform, and emoji faces).

## Architecture

### Services
Located in `src/app/services/`

#### ParticleSystemService
- **Purpose**: Manages the Three.js 3D particle system
- **Features**:
  - 5000 particles with dynamic positions
  - Multiple visualization modes (sphere, heart, wave, emoji)
  - Smooth transitions between shapes
  - Mouse interaction
  - Responsive rendering

#### ClockService
- **Purpose**: Provides real-time clock and date updates
- **Features**:
  - Observable-based time updates every second
  - Formatted time and date strings

### Components
Located in `src/app/components/`

#### ControlButtonComponent (Generic/Reusable)
- **Path**: `components/control-button/`
- **Purpose**: Reusable button component with multiple states
- **Inputs**:
  - `iconClass`: Font Awesome icon class
  - `title`: Tooltip text
  - `isActive`: Active state
  - `isMicButton`: Special styling for mic button
  - `activeClass`: Active state variant (heart, emoji, chat)
- **Output**: `buttonClick` event
- **Usage**: Used throughout the app for consistent button styling

#### ChatPanelComponent
- **Path**: `components/chat-panel/`
- **Purpose**: Side-sliding chat interface
- **Features**:
  - Text messaging with AI responses
  - Image upload support
  - Markdown rendering (using marked.js)
  - Simulated AI responses
  - Smooth slide-in animation
- **Inputs**: `isOpen`
- **Output**: `close` event

#### HudHeaderComponent
- **Path**: `components/hud-header/`
- **Purpose**: Top header with system status, clock, and weather widget
- **Inputs**:
  - `systemText`: Status message
  - `time`: Current time
  - `date`: Current date

#### ControlsDockComponent
- **Path**: `components/controls-dock/`
- **Purpose**: Bottom center microphone control
- **Inputs**: `isMicActive`
- **Output**: `micClick` event

#### SideDockComponent
- **Path**: `components/side-dock/`
- **Purpose**: Left-side vertical button dock
- **Features**: Chat, Emoji, and Heart mode buttons
- **Inputs**: Active states for each button
- **Outputs**: Events for each button click

#### ParticleCanvasComponent
- **Path**: `components/particle-canvas/`
- **Purpose**: Container for the Three.js particle system
- **Inputs**: `mode` - Visualization mode
- **Features**:
  - Initializes particle system on mount
  - Cleans up on destroy
  - Dynamic filter effects based on mode

### Pages

#### Home Component
- **Path**: `pages/home/`
- **Purpose**: Main page integrating all components
- **State Management**:
  - `currentMode`: Current visualization mode
  - `isChatOpen`: Chat panel state
  - `isListening`: Microphone active state
  - `isHeartMode`: Heart visualization state
  - `isEmojiMode`: Emoji visualization state
- **Methods**:
  - `onMicClick()`: Toggle voice/waveform mode
  - `onHeartClick()`: Toggle heart mode
  - `onEmojiClick()`: Toggle emoji mode
  - `onChatToggle()`: Toggle chat panel
  - `resetStates()`: Reset all modes to default

## Visualization Modes

1. **Sphere Mode** (Default)
   - Liquid bubble with procedural noise
   - Cyan glow effect
   - Continuous rotation

2. **Heart Mode**
   - Particles form a 3D heart shape
   - Pink/red color scheme
   - Triggered by heart button

3. **Wave Mode**
   - Audio waveform visualization
   - Dynamic amplitude based on time
   - Triggered by microphone button

4. **Emoji Mode**
   - Animated facial expressions
   - Cycles through: Happy → Surprised → Sad
   - Gold/yellow color scheme
   - Face follows mouse movement

## External Dependencies

Added to [index.html](src/index.html):
- **Three.js**: 3D graphics and particle system
- **Anime.js**: Smooth animations
- **Marked.js**: Markdown parsing in chat
- **Font Awesome**: Icons
- **Google Fonts**: Rajdhani and Share Tech Mono

## Styling

- **CSS Variables**: Defined in component styles for easy theming
- **Colors**:
  - Primary: `#00f3ff` (Cyan)
  - Secondary: `#ff0055` (Pink)
  - Gold: `#ffd700` (Yellow)
- **Glassmorphism**: Used for UI elements
- **Animations**: Smooth transitions and hover effects

## Component Reusability

The **ControlButtonComponent** is highly reusable:
```typescript
// Example usage
<app-control-button
  iconClass="fas fa-heart"
  title="Love Mode"
  [isActive]="isHeartActive"
  activeClass="heart"
  (buttonClick)="onHeartClick()"
/>
```

Different configurations:
- Mic button: `[isMicButton]="true"` (larger size)
- Active states: `activeClass="heart"` | `"emoji"` | `"chat"`
- Any Font Awesome icon via `iconClass`

## Performance Considerations

- **Change Detection**: `OnPush` strategy for better performance
- **Observable Cleanup**: `takeUntil` pattern with destroy$ subject
- **RequestAnimationFrame**: Smooth 60fps particle animations
- **Standalone Components**: Reduced bundle size

## Development

### Running the App
```bash
npm install
npm start
```

### Building
```bash
npm run build
```

## Future Enhancements

- Voice recognition integration
- Real-time weather API
- More emotion expressions
- Custom particle shapes
- Audio reactive visualizations
- Speech synthesis responses

## File Structure
```
src/app/
├── components/
│   ├── chat-panel/
│   ├── control-button/ (Generic)
│   ├── controls-dock/
│   ├── hud-header/
│   ├── particle-canvas/
│   └── side-dock/
├── services/
│   ├── particle-system.service.ts
│   └── clock.service.ts
└── pages/
    └── home/
        ├── home.ts
        ├── home.html
        └── home.css
```

## License
MIT
