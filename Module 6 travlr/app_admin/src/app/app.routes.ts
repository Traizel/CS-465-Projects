import { Routes } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { AddTripComponent } from './add-trip/add-trip.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';

export const routes: Routes = [
  { path: '', component: TripListingComponent, title: 'Trips | Travlr Getaways' },
  { path: 'add-trip', component: AddTripComponent, title: 'Add Trip | Travlr Getaways' },
  { path: 'edit-trip/:code', component: EditTripComponent, title: 'Edit Trip | Travlr Getaways' },
  { path: '**', redirectTo: '' }
];
