import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  isLoggingOut = signal<boolean>(false);

  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', route: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: 'fa-users', route: '/admin/users' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-cube', route: '/admin/inventory' },
    { id: 'orders', label: 'Orders', icon: 'fa-shopping-cart', route: '/admin/orders' },
    { id: 'issues', label: 'Issues', icon: 'fa-triangle-exclamation', route: '/admin/issues' },
    { id: 'reports', label: 'Reports', icon: 'fa-chart-line', route: '/admin/reports' },
    { id: 'backup', label: 'Backup', icon: 'fa-cloud-upload-alt', route: '/admin/backup' },
    { id: 'content', label: 'Content', icon: 'fa-clipboard', route: '/admin/content' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell', route: '/admin/notifications' },
    { id: 'profile', label: 'Settings', icon: 'fa-gear', route: '/admin/profile', active: true }
  ];

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }

  /**
   * Logout the admin user
   * Calls the backend logout endpoint to revoke tokens and terminate session
   * Falls back to local logout if API fails to ensure user is logged out locally
   */
  logout() {
    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      next: (response) => {
        this.toastService.show('Logged out successfully');
        this.isLoggingOut.set(false);
        this.router.navigate(['/admin-login']);
        this.closeSidebar.emit();
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Even if API call fails, clear local auth state for security
        this.authService.logoutLocally();
        this.toastService.show('Logged out successfully');
        this.isLoggingOut.set(false);
        this.router.navigate(['/admin-login']);
        this.closeSidebar.emit();
      }
    });
  }

  onCloseSidebar() {
    this.closeSidebar.emit();
  }
}
