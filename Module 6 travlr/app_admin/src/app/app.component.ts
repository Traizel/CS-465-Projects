import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom mb-4">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">Travlr Getaways Admin</a>
        <div class="ms-auto"><a class="nav-link" routerLink="/">All Trips</a></div>
      </div>
    </nav>
    <main class="container mb-5"><router-outlet></router-outlet></main>
  `
})
export class AppComponent {}
