import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';

import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { SymptomCheckerPageComponent } from './pages/symptom-checker-page/symptom-checker-page';
import { AdminLayoutComponent } from './layouts/admin-layout';
import { ProfileManagementComponent } from './pages/profile-management/profile-management';

export const routes: Routes = [
  // Public routes - accessible by everyone (guest, customer, admin)
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin/reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'symptom-checker',
    component: SymptomCheckerPageComponent
  },
  // Customer-only routes
  {
    path: 'profile',
    loadComponent: () => import('./pages/customer-profile/customer-profile').then(m => m.CustomerProfileComponent),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/customer-orders/customer-orders').then(m => m.CustomerOrdersComponent),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: 'me/dashboard',
    loadComponent: () => import('./pages/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help').then(m => m.HelpComponent),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  // Admin routes with layout - protected by RoleGuard
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'profile',
        component: ProfileManagementComponent
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin-users/admin-users').then(m => m.AdminUsersComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/admin-inventory/admin-inventory').then(m => m.AdminInventoryComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin-orders/admin-orders').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'issues',
        loadComponent: () => import('./pages/admin-issues/admin-issues').then(m => m.AdminIssuesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/admin-reports/admin-reports').then(m => m.AdminReportsComponent)
      },
      {
        path: 'backup',
        loadComponent: () => import('./pages/admin-backup/admin-backup').then(m => m.AdminBackupComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/admin-content/admin-content').then(m => m.AdminContentComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/admin-notifications/admin-notifications').then(m => m.AdminNotificationsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];