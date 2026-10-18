import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
export const authGuard: CanActivateFn = () => inject(AuthenticationService).isLoggedIn()
  || inject(Router).createUrlTree(['/login']);
