import { CommonModule } from '@angular/common';
import { AuthenticationService } from './services/authentication.service';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom mb-4">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">Travlr Getaways Admin</a>
        <div class="ms-auto d-flex align-items-center gap-3"><a class="nav-link" routerLink="/">All Trips</a>
        <a *ngIf="!auth.isLoggedIn()" class="nav-link" routerLink="/login">Log in</a>
        <span *ngIf="auth.isLoggedIn()">{{ auth.getCurrentUser()?.name }}</span>
        <button *ngIf="auth.isLoggedIn()" class="btn btn-outline-secondary btn-sm" (click)="logout()">Log out</button></div>
      </div>
    </nav>
    <main class="container mb-5"><router-outlet></router-outlet></main>
  `
})
export class AppComponent {
  constructor(public auth: AuthenticationService, private router: Router) {}
  logout(): void { this.auth.logout(); void this.router.navigate(['/']); }
}
