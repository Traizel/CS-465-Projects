import { authGuard } from './services/auth.guard';
import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { AddTripComponent } from './add-trip/add-trip.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';

export const routes: Routes = [
  { path: '', component: TripListingComponent, title: 'Trips | Travlr Getaways' },
  { path: 'add-trip', canActivate: [authGuard], component: AddTripComponent, title: 'Add Trip | Travlr Getaways' },
  { path: 'edit-trip/:code', canActivate: [authGuard], component: EditTripComponent, title: 'Edit Trip | Travlr Getaways' },
  { path: 'login', component: LoginComponent, title: 'Login | Travlr Getaways' },
  { path: '**', redirectTo: '' }
];
