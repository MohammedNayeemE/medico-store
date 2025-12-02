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
  // Admin routes with layout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // canActivate: [RoleGuard],
    // data: { roles: ['admin'] },
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
  // Example: Protected routes that require authentication
  // {
  //   path: 'admin',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['admin'] },
  //   children: [
  //     // Admin routes here
  //   ]
  // },
  // {
  //   path: 'vendor',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['vendor'] },
  //   children: [
  //     // Vendor routes here
  //   ]
  // },
  // {
  //   path: 'profile',
  //   canActivate: [AuthGuard],
  //   children: [
  //     // Protected customer routes here
  //   ]
  // },
  {
    path: '**',
    redirectTo: ''
  }
];