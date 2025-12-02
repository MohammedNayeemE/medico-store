import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.html',
  imports : [CommonModule , ReactiveFormsModule, LoadingScreenComponent] , 
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  loadingTitle = 'Redirecting';
  loadingMessage = 'Setting up your password reset...';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword() {
    this.isLoading = true;
    // Wait for 1 second and then navigate to reset-password
    setTimeout(() => {
      this.router.navigate(['/admin/reset-password']);
      this.isLoading = false;
    }, 2000);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Handle admin login logic here
      console.log('Admin login:', this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
