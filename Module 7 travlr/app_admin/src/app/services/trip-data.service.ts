import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Trip } from '../models/trip';

@Injectable({ providedIn: 'root' })
export class TripDataService {
  private readonly tripsUrl = 'http://localhost:3000/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.tripsUrl);
  }

  getTrip(code: string): Observable<Trip> {
    // The Module 5 API returns an array even for a single trip.
    return this.http.get<Trip[]>(`${this.tripsUrl}/${encodeURIComponent(code)}`).pipe(
      map(trips => {
        if (trips.length === 0) throw new Error('Trip not found.');
        return trips[0];
      })
    );
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.tripsUrl, trip);
  }

  updateTrip(code: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.tripsUrl}/${encodeURIComponent(code)}`, trip);
  }

  deleteTrip(code: string): Observable<{ message: string; code: string }> {
    return this.http.delete<{ message: string; code: string }>(
      `${this.tripsUrl}/${encodeURIComponent(code)}`
    );
  }
}
