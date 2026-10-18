import { AuthenticationService } from '../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, TripCardComponent],
  templateUrl: './trip-listing.component.html'
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  message = 'Loading trips...';
  error = '';
  loading = false;

  constructor(public auth: AuthenticationService, private tripDataService: TripDataService) {}

  ngOnInit(): void { this.loadTrips(); }

  loadTrips(): void {
    this.loading = true;
    this.error = '';
    this.tripDataService.getTrips().subscribe({
      next: trips => {
        this.trips = trips;
        this.message = `${trips.length} trip${trips.length === 1 ? '' : 's'} available.`;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Could not load trips. Is the Express server running?';
        this.message = '';
        this.loading = false;
      }
    });
  }

  deleteTrip(trip: Trip): void {
    if (!window.confirm(`Delete ${trip.name}? This cannot be undone.`)) return;
    this.error = '';
    this.tripDataService.deleteTrip(trip.code).subscribe({
      next: () => this.loadTrips(),
      error: err => this.error = err.error?.message || 'Unable to delete trip.'
    });
  }
}
