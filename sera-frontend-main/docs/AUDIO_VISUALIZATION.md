# Real-Time Audio Visualization

## Overview

The audio visualization feature uses the browser's **Web Audio API** to capture microphone input in real-time and make the particle system react to sound. The particles respond to your voice, music, claps, and any audio input!

## Features

### Audio Reactive Effects

1. **Sphere Mode** 🌐
   - Bass frequencies make the sphere expand and contract
   - Creates ripple effects across the surface
   - Volume controls overall brightness

2. **Wave Mode** 🌊
   - Treble frequencies create additional wave heights
   - High-pitched sounds make the waves jump higher
   - Perfect for music visualization

3. **Heart Mode** ❤️
   - Heart beats and pulses with bass
   - Creates a "heartbeat" effect in sync with music
   - Low frequencies control the beating intensity

4. **Emoji Mode** 😊
   - Emojis bounce with the volume
   - Reacts to sudden sounds like claps
   - Overall audio level controls bounce height

### Audio Data Processing

The system analyzes three frequency bands:

- **Bass** (0-10 bins): Low frequencies, controls expansion and beating
- **Mid** (10-50 bins): Mid-range frequencies, balanced reactivity
- **Treble** (50-128 bins): High frequencies, controls wave heights and brightness

## How to Use

1. **Enable Audio Visualization**
   - Click the microphone button
   - Grant microphone permission when prompted
   - The system will display "AUDIO REACTIVE MODE"

2. **Test It Out**
   - Speak into your microphone
   - Play music near your device
   - Clap your hands
   - Whistle or hum
   - The particles will react in real-time!

3. **Disable Audio**
   - Click the microphone button again
   - Audio visualization stops immediately
   - Microphone access is released

## Technical Implementation

### AudioVisualizationService

Located in `src/app/services/audio-visualization.service.ts`

**Key Components:**
- `AudioContext`: Web Audio API context
- `AnalyserNode`: Frequency analysis (FFT size: 256)
- `MediaStreamSource`: Microphone input
- `Uint8Array`: Frequency data buffer (128 bins)

**Audio Settings:**
```typescript
{
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false  // Preserves dynamic range
}
```

**Smoothing:** 0.8 (prevents jittery movements)

### Particle System Integration

Located in `src/app/services/particle-system.service.ts`

**Audio Calculations:**
```typescript
// Overall volume boost (0-2x)
audioBoost = (volume / 100) * 2

// Bass boost (0-3x) - for expansion
bassBoost = (bassLevel / 100) * 3

// Treble boost (0-1.5x) - for waves
trebleBoost = (trebleLevel / 100) * 1.5
```

**Applied Effects:**
- **Radius**: `300 + (bassBoost * 50)` - Sphere size
- **Brightness**: `70 + (audioBoost * 20)%` - Color brightness
- **Wave Height**: `trebleBoost * 100` - Additional wave amplitude
- **Heart Scale**: `1 + (bassBoost * 0.1)` - Heart pulsing
- **Ripple**: `audioBoost * 30` - Sphere surface ripples

## Performance Optimization

- **Frame Rate**: Analyzes audio at 60 FPS (requestAnimationFrame)
- **Smoothing**: 0.8 constant prevents rapid jumps
- **Lazy Updates**: Only recalculates when audio data changes
- **Resource Cleanup**: Properly disposes AudioContext on stop

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | Best performance |
| Edge    | ✅ Full | Chromium-based |
| Firefox | ✅ Full | Good support |
| Safari  | ⚠️ Partial | Requires HTTPS |
| Opera   | ✅ Full | Chromium-based |

**Requirements:**
- HTTPS connection (localhost works for development)
- Microphone permission granted
- Web Audio API support

## Privacy & Security

- **Microphone Access**: Requested only when you click the mic button
- **No Recording**: Audio is analyzed in real-time, never stored
- **Local Processing**: All analysis happens in your browser
- **Instant Release**: Microphone access stops when you disable the feature

## Troubleshooting

### No Audio Reactivity

1. **Check Permission**: Browser may have blocked microphone
2. **Test Microphone**: Verify device is working in system settings
3. **Volume Level**: Speak louder or move closer to mic
4. **Browser Console**: Check for error messages

### Delayed Response

- Increase `autoGainControl` if sounds are too quiet
- Reduce `smoothingTimeConstant` for snappier response (less smooth)

### Permission Denied

- Click the 🔒 lock icon in address bar
- Allow microphone access for the site
- Refresh and try again

## Code Examples

### Starting Audio Visualization

```typescript
const success = await audioService.startAudioVisualization();
if (success) {
  console.log('Audio reactive mode enabled!');
}
```

### Monitoring Audio Data

```typescript
audioService.audioData$.subscribe(data => {
  console.log('Volume:', data.volume);
  console.log('Bass:', data.bassLevel);
  console.log('Treble:', data.trebleLevel);
});
```

### Stopping Audio

```typescript
audioService.stopAudioVisualization();
```

## Future Enhancements

Potential additions:
- Beat detection for automatic emoji switching
- Frequency-based color changes
- Custom audio source selection (system audio, music files)
- Audio recording and playback
- Spectrum analyzer overlay
- Equalizer controls
