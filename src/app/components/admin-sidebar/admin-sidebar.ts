import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
    this.closeSidebar.emit();
  }

  onCloseSidebar() {
    this.closeSidebar.emit();
  }
}
