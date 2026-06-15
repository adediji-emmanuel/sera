import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeName = 'future' | 'synthwave' | 'hacker' | 'industrial';

export interface Theme {
  name: ThemeName;
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  hue: number;
}

export const THEMES: Record<ThemeName, Theme> = {
  future: {
    name: 'future',
    displayName: 'Future',
    primary: '#00f3ff',
    secondary: '#ff0055',
    accent: '#ffd700',
    hue: 180
  },
  synthwave: {
    name: 'synthwave',
    displayName: 'Synthwave',
    primary: '#b967ff',
    secondary: '#ff6ec7',
    accent: '#05ffa1',
    hue: 280
  },
  hacker: {
    name: 'hacker',
    displayName: 'Hacker',
    primary: '#00ff41',
    secondary: '#39ff14',
    accent: '#0dff00',
    hue: 125
  },
  industrial: {
    name: 'industrial',
    displayName: 'Industrial',
    primary: '#ff8c00',
    secondary: '#ff6b00',
    accent: '#ffa500',
    hue: 30
  }
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>(THEMES.future);
  public theme$ = this.currentTheme$.asObservable();

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && THEMES[savedTheme]) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(themeName: ThemeName): void {
    const theme = THEMES[themeName];
    if (!theme) return;

    this.currentTheme$.next(theme);
    localStorage.setItem('theme', themeName);

    // Update CSS variables on document root
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    document.documentElement.style.setProperty('--glass-border', `${this.hexToRgba(theme.primary, 0.2)}`);
    document.documentElement.style.setProperty('--chat-user-bg', `${this.hexToRgba(theme.primary, 0.15)}`);
  }

  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  getThemeHue(): number {
    return this.currentTheme$.value.hue;
  }

  getAllThemes(): Theme[] {
    return Object.values(THEMES);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
