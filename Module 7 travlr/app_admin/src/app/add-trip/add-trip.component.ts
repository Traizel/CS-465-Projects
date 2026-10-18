import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-trip.component.html'
})
export class AddTripComponent {
  submitted = false;
  saving = false;
  error = '';
  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    length: ['', Validators.required],
    start: ['', Validators.required],
    resort: ['', Validators.required],
    perPerson: ['', [Validators.required, Validators.min(0)]],
    image: ['', Validators.required],
    description: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private router: Router,
              private tripDataService: TripDataService) {}

  get f() { return this.form.controls; }

  save(): void {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const values = this.form.getRawValue();
    const trip: Trip = {
      ...values,
      perPerson: String(values.perPerson),
      start: new Date(`${values.start}T12:00:00.000Z`).toISOString()
    };
    this.tripDataService.addTrip(trip).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.error = err.error?.message || 'Failed to add the trip.';
        this.saving = false;
      }
    });
  }
}
