import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkRoles(route);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkRoles(route);
  }

  private checkRoles(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('Access denied: User not authenticated');
      return this.router.createUrlTree(['/login']);
    }

    // Check if user has required roles (any match is sufficient)
    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // If require all roles specified in data['requireAllRoles']
    const requireAllRoles = route.data['requireAllRoles'] as boolean | undefined;
    if (requireAllRoles && this.authService.hasAllRoles(requiredRoles)) {
      return true;
    }

    console.warn(
      `Access denied: User does not have required roles. Required: ${requiredRoles.join(', ')}, User roles: ${this.authService.getUserRoles().join(', ')}`
    );
    return this.router.createUrlTree(['/unauthorized']);
  }
}
