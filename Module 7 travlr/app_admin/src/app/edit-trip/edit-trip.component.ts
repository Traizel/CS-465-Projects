import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-trip.component.html'
})
export class EditTripComponent implements OnInit {
  submitted = false;
  saving = false;
  loading = true;
  error = '';
  tripCode = '';
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

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
              private router: Router, private tripDataService: TripDataService) {}

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.tripCode = this.route.snapshot.paramMap.get('code') ?? '';
    this.tripDataService.getTrip(this.tripCode).subscribe({
      next: trip => {
        // MongoDB Date values are ISO strings; HTML date inputs require YYYY-MM-DD.
        this.form.patchValue({ ...trip, start: trip.start.slice(0, 10) });
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Unable to retrieve this trip.';
        this.loading = false;
      }
    });
  }

  save(): void {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid || this.saving || this.loading) return;
    this.saving = true;
    const values = this.form.getRawValue();
    const trip: Trip = {
      ...values,
      perPerson: String(values.perPerson),
      start: new Date(`${values.start}T12:00:00.000Z`).toISOString()
    };
    this.tripDataService.updateTrip(this.tripCode, trip).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.error = err.error?.message || 'Failed to update trip.';
        this.saving = false;
      }
    });
  }
}
