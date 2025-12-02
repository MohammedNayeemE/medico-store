import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'customer' | 'vendor' | 'guest';

export interface User {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  roles?: UserRole[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Using signals for reactive state management
  private userSignal = signal<User | null>(this.loadUser());
  
  // Public readonly signal
  public user = this.userSignal.asReadonly();
  
  // Computed signals for common checks
  public isAuthenticated = computed(() => this.userSignal()?.isAuthenticated ?? false);
  public userRoles = computed(() => this.userSignal()?.roles ?? []);

  constructor() {}

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem('User');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  hasRole(role: UserRole): boolean {
    const user = this.userSignal();
    if (!user?.isAuthenticated || !user?.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.userSignal();
    if (!user?.isAuthenticated || !user?.roles) {
      return false;
    }
    return roles.some(role => user.roles?.includes(role));
  }

  hasAllRoles(roles: UserRole[]): boolean {
    const user = this.userSignal();
    if (!user?.isAuthenticated || !user?.roles) {
      return false;
    }
    return roles.every(role => user.roles?.includes(role));
  }

  login(user: User): void {
    // Ensure user has at least 'customer' role if authenticated
    if (user.isAuthenticated && (!user.roles || user.roles.length === 0)) {
      user.roles = ['customer'];
    }
    localStorage.setItem('User', JSON.stringify(user));
    this.userSignal.set(user);
  }

  logout(): void {
    localStorage.removeItem('User');
    this.userSignal.set(null);
  }

  getUser(): User | null {
    return this.userSignal();
  }

  getUserRoles(): UserRole[] {
    return this.userRoles();
  }
}