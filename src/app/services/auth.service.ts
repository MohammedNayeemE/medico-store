import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserRole = 'admin' | 'customer' | 'vendor' | 'guest';

export interface User {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  roles?: UserRole[];
  user_id?: number;
  session_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Using signals for reactive state management
  private userSignal = signal<User | null>(this.loadUser());
  private accessTokenSignal = signal<string | null>(this.loadAccessToken());
  
  // Public readonly signal
  public user = this.userSignal.asReadonly();
  
  // Computed signals for common checks
  public isAuthenticated = computed(() => this.userSignal()?.isAuthenticated ?? false);
  public userRoles = computed(() => this.userSignal()?.roles ?? []);
  public accessToken = this.accessTokenSignal.asReadonly();
  private http = inject(HttpClient);

  private readonly API_BASE = `${environment.apiBaseUrl}/auth`;

  constructor() {}

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem('User');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private loadAccessToken(): string | null {
    return null;
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

  // Admin login via FastAPI
  // Note: captcha_token is optional - only required if backend validation is enabled
  adminLogin(payload: { email: string; password: string; captcha_token?: string }): Observable<any> {
    return this.http.post(`${this.API_BASE}/admin-login`, payload, { withCredentials: true }).pipe(
      tap((res: any) => {
        // Backend sets HttpOnly cookies; we cannot read them. Use response body to set state.
        const user: User = {
          isAuthenticated: true,
          email: res?.email,
          roles: ['admin'],
          user_id: res?.user_id,
          session_id: res?.session_id,
        };
        this.login(user);
        // Store bearer access token from response for Authorization header usage
        const token: string | null = res?.access_token ?? null;
        if (token) {
          this.accessTokenSignal.set(token);
        }
      })
    );
  }

  // Admin logout (relies on cookies; backend expects Authorization header, which we cannot read from HttpOnly cookie).
  // We still call the endpoint with credentials; if backend supports cookie-based logout, it will work.
  adminLogout(): Observable<any> {
    return this.http.post(`${this.API_BASE}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.logout();
        this.accessTokenSignal.set(null);
      })
    );
  }

  // Logout from all devices
  adminLogoutAll(): Observable<any> {
    return this.http.post(`${this.API_BASE}/logout-all`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.logout();
        this.accessTokenSignal.set(null);
      })
    );
  }

  // Refresh access token using refresh cookie
  refreshToken(): Observable<{ access_token: string; token_type: string }> {
    return this.http.post<{ access_token: string; token_type: string }>(`${this.API_BASE}/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        const token = res?.access_token;
        if (token) {
          this.accessTokenSignal.set(token);
        }
      })
    );
  }

  // Customer OTP login - Get OTP
  getOtp(phoneNumber: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/get-otp`, { phone_number: phoneNumber });
  }

  // Customer OTP login - Verify OTP and login
  customerLogin(phoneNumber: string, otp: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/login`, { 
      phone_number: phoneNumber, 
      otp: otp,
      role_id: 1 // Customer role ID
    }, { withCredentials: true }).pipe(
      tap((res: any) => {
        // Backend sets HttpOnly cookies for refresh token
        const user: User = {
          isAuthenticated: true,
          roles: ['customer'],
          user_id: res?.user_id,
          session_id: res?.session_id,
        };
        this.login(user);
        // Store access token if provided
        const token: string | null = res?.access_token ?? null;
        if (token) {
          this.accessTokenSignal.set(token);
        }
      })
    );
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

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }
}