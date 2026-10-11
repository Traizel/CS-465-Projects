import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trip-card.component.html'
})
export class TripCardComponent {
  @Input({ required: true }) trip!: Trip;
  @Output() deleteRequested = new EventEmitter<Trip>();

  requestDelete(): void {
    this.deleteRequested.emit(this.trip);
  }
}
