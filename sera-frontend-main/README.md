# A.I. Voice Assistant Interface

A futuristic A.I. Voice Assistant Interface built with **Angular 18+**, **Tauri**, and **Three.js**, featuring dynamic 3D particle visualizations.

![Angular](https://img.shields.io/badge/Angular-18+-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![Tauri](https://img.shields.io/badge/Tauri-Desktop-blue?logo=tauri)

## ✨ Features

- 🎨 **4 Particle Visualization Modes**
  - Liquid sphere with procedural noise
  - 3D heart shape animation
  - Audio waveform visualization
  - Animated emoji faces (Happy, Sad, Surprised)

- 💬 **Interactive Chat Panel**
  - Text messaging with AI responses
  - Image upload support
  - Markdown rendering

- 🎯 **Generic Button Component**
  - Highly reusable with any Font Awesome icon
  - Multiple active state variants
  - Glassmorphism design

- 🎭 **Professional UI**
  - Real-time clock display
  - System status indicators
  - Weather widget
  - Smooth animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Or run Tauri desktop app
npm run tauri dev
```

Then open http://localhost:4200

## 📚 Documentation

All comprehensive documentation is located in the **[`docs/`](docs/)** folder:

| Document | Description |
|----------|-------------|
| **[📖 DOCS_INDEX](docs/DOCS_INDEX.md)** | Documentation hub - **Start here!** |
| **[🚀 QUICK_START](docs/QUICK_START.md)** | Code examples and how-tos |
| **[🗺️ COMPONENT_MAP](docs/COMPONENT_MAP.md)** | Visual component diagrams |
| **[🏗️ ARCHITECTURE](docs/ARCHITECTURE.md)** | Technical deep dive |
| **[📝 IMPLEMENTATION_SUMMARY](docs/IMPLEMENTATION_SUMMARY.md)** | Feature overview |
| **[🎨 VISUAL_GUIDE](docs/VISUAL_GUIDE.md)** | Before/after comparison |
| **[✅ COMPLETE](docs/COMPLETE.md)** | Implementation summary |

## 🎯 Interactive Demo

Once running, try these interactions:

1. **🎤 Microphone** (bottom center) - Waveform visualization
2. **❤️ Heart** (left side) - 3D heart shape
3. **😊 Emoji** (left side) - Animated facial expressions
4. **💬 Chat** (left side) - Chat interface with image upload

## 🏗️ Architecture

```
src/app/
├── services/              # Business logic
│   ├── particle-system.service.ts
│   └── clock.service.ts
│
├── components/            # Reusable UI components
│   ├── control-button/    ⭐ Generic & reusable
│   ├── chat-panel/
│   ├── hud-header/
│   ├── controls-dock/
│   ├── side-dock/
│   └── particle-canvas/
│
└── pages/                 # Main views
    └── home/
```

## 🛠️ Technologies

- **Angular 18+** - Framework
- **TypeScript** - Language
- **Tauri** - Desktop application
- **Three.js** - 3D rendering
- **Anime.js** - Animations
- **Marked.js** - Markdown parsing
- **Font Awesome** - Icons
- **RxJS** - Reactive programming

## 📦 Key Components

### ⭐ Generic Button Component
Highly reusable button that accepts any icon and styling variant:

```typescript
<app-control-button
  iconClass="fas fa-heart"
  title="Love Mode"
  [isActive]="isHeartActive"
  activeClass="heart"
  (buttonClick)="onHeartClick()"
/>
```

### 🎨 Particle System Service
Manages 5,000 particles with smooth morphing between shapes:
- Sphere mode (default liquid bubble)
- Heart mode (3D heart shape)
- Wave mode (audio waveform)
- Emoji mode (facial expressions)

### 💬 Chat Panel
Slide-in chat interface with:
- Text messaging
- Image upload
- Markdown support
- AI response simulation

## 🎨 Customization

### Change Colors
Edit CSS variables in any component:

```css
:host {
  --primary-color: #00f3ff;     /* Cyan */
  --secondary-color: #ff0055;   /* Pink */
  --gold-color: #ffd700;        /* Gold */
}
```

### Add New Visualization
See [docs/QUICK_START.md](docs/QUICK_START.md#1-add-a-new-visualization-mode)

### Create Custom Buttons
See [docs/QUICK_START.md](docs/QUICK_START.md#2-add-a-new-button-to-side-dock)

## 📈 Performance

- **OnPush** change detection strategy
- **60 FPS** particle rendering via requestAnimationFrame
- **Lazy loading** ready
- **Tree-shakeable** standalone components

## 🧪 Code Quality

- ✅ TypeScript strict mode
- ✅ Standalone components (no NgModule)
- ✅ Proper lifecycle management
- ✅ Observable patterns
- ✅ Component encapsulation
- ✅ No compilation errors

## 🔮 Future Enhancements

- Real voice recognition
- Live weather API integration
- More emotion expressions
- Custom particle shapes
- Audio reactive visualizations
- Speech synthesis responses

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).

## 📄 License

MIT

## 🙏 Acknowledgments

Built with modern Angular best practices and stunning Three.js visualizations.

---

**📚 For detailed documentation, see the [`docs/`](docs/) folder.**

**🚀 Start with [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md) for a complete guide!**
