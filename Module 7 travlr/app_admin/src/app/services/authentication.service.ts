import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
export interface User { _id: string; email: string; name: string; exp: number; }
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly key = 'travlr-token';
  constructor(private http: HttpClient) {}
  getToken(): string { return localStorage.getItem(this.key) || ''; }
  logout(): void { localStorage.removeItem(this.key); }
  getCurrentUser(): User | null {
    try {
      const part = this.getToken().split('.')[1];
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
      const user = JSON.parse(new TextDecoder().decode(bytes)) as User;
      if (!user._id || !Number.isFinite(user.exp) || user.exp * 1000 <= Date.now()) return null;
      return user;
    } catch { return null; }
  }
  isLoggedIn(): boolean { return this.getCurrentUser() !== null; }
  login(email: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:3000/api/login', { email, password })
      .pipe(tap(result => localStorage.setItem(this.key, result.token)));
  }
}
