import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

export interface ClockData {
  time: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private clockData$ = new BehaviorSubject<ClockData>({
    time: '00:00',
    date: 'JAN 01 2026'
  });

  public clock$ = this.clockData$.asObservable();

  constructor() {
    this.updateClock();
    interval(1000).subscribe(() => this.updateClock());
  }

  private updateClock(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const date = now.toLocaleDateString('en-US', options).toUpperCase();

    this.clockData$.next({ time, date });
  }
}
