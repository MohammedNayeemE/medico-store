import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  
  // Using signals for reactive state management
  showTermsModal = signal(false);
  showPrivacyModal = signal(false);
  isLoading = signal(false);
  showOtpForm = signal(false);
  otpSent = signal(false);
  resendingOtp = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeLoginForm();
    this.initializeOtpForm();
  }

  initializeLoginForm(): void {
    this.loginForm = this.fb.group({
      phoneNumber: [
        '+91',
        [
          Validators.required,
          this.phoneNumberValidator.bind(this)
        ]
      ]
    });
  }

  initializeOtpForm(): void {
    this.otpForm = this.fb.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^\d{6}$/)
        ]
      ]
    });
  }

  /**
   * Custom validator for phone number
   * Validates that the phone number is in the format +91XXXXXXXXXX (10 digits after +91)
   */
  phoneNumberValidator(control: any) {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Remove spaces and hyphens
    const cleanedValue = value.replace(/[\s-]/g, '');

    // Check if it matches the pattern: +91 followed by exactly 10 digits
    const phonePattern = /^\+91\d{10}$/;
    const isValid = phonePattern.test(cleanedValue);

    return isValid ? null : { invalidPhoneNumber: true };
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;

    // Call the get-otp API endpoint
    this.authService.getOtp(phoneNumber).subscribe({
      next: (response) => {
        console.log('OTP sent successfully:', response);
        this.toastService.success('OTP sent successfully to ' + phoneNumber, 3000);
        this.showOtpForm.set(true);
        this.otpSent.set(true);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error sending OTP:', error);
        this.isLoading.set(false);
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.toastService.error('Invalid phone number format', 4000);
        } else if (error.status === 429) {
          this.toastService.error('Too many OTP requests. Please try again later', 4000);
        } else if (error.status === 500) {
          this.toastService.error('Failed to send OTP. Please try again', 4000);
        } else {
          this.toastService.error('An error occurred. Please try again', 4000);
        }
      }
    });
  }

  onSubmitOtp(): void {
    if (this.otpForm.invalid) {
      this.markFormGroupTouched(this.otpForm);
      return;
    }

    this.isLoading.set(true);
    const otp = this.otpForm.get('otp')?.value;
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;

    // Call the login API endpoint with OTP
    this.authService.customerLogin(phoneNumber, otp).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.toastService.success('Login successful! Welcome to Medico Store', 3000);
        this.isLoading.set(false);
        
        // Navigate to home page after successful login
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error verifying OTP:', error);
        this.isLoading.set(false);
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.toastService.error('Invalid OTP. Please check and try again', 4000);
        } else if (error.status === 404) {
          this.toastService.error('OTP expired. Please request a new one', 4000);
          // Reset to phone form
          this.onBackToPhoneForm();
        } else if (error.status === 500) {
          this.toastService.error('Login failed. Please try again', 4000);
        } else {
          this.toastService.error('An error occurred. Please try again', 4000);
        }
      }
    });
  }

  onBackToPhoneForm(): void {
    this.showOtpForm.set(false);
    this.otpSent.set(false);
    this.otpForm.reset();
  }

  onResendOtp(): void {
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;
    
    if (!phoneNumber) {
      this.toastService.error('Phone number is required', 3000);
      return;
    }

    this.resendingOtp.set(true);

    // Call the get-otp API endpoint again
    this.authService.getOtp(phoneNumber).subscribe({
      next: (response) => {
        console.log('OTP resent successfully:', response);
        this.toastService.success('OTP resent successfully!', 3000);
        this.resendingOtp.set(false);
        this.otpForm.reset(); // Clear the OTP input
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error resending OTP:', error);
        this.resendingOtp.set(false);
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.toastService.error('Invalid phone number format', 4000);
        } else if (error.status === 429) {
          this.toastService.error('Too many OTP requests. Please try again later', 4000);
        } else if (error.status === 500) {
          this.toastService.error('Failed to resend OTP. Please try again', 4000);
        } else {
          this.toastService.error('An error occurred. Please try again', 4000);
        }
      }
    });
  }

  openTermsModal(): void {
    this.showTermsModal.set(true);
  }

  closeTermsModal(): void {
    this.showTermsModal.set(false);
  }

  openPrivacyModal(): void {
    this.showPrivacyModal.set(true);
  }

  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get phoneNumberError(): string {
    const phoneControl = this.loginForm.get('phoneNumber');
    if (phoneControl?.hasError('required')) {
      return 'Phone number is required';
    }
    if (phoneControl?.hasError('invalidPhoneNumber')) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  }

  get otpError(): string {
    const otpControl = this.otpForm.get('otp');
    if (otpControl?.hasError('required')) {
      return 'OTP is required';
    }
    if (otpControl?.hasError('minlength') || otpControl?.hasError('maxlength')) {
      return 'OTP must be 6 digits';
    }
    if (otpControl?.hasError('pattern')) {
      return 'OTP must contain only numbers';
    }
    return '';
  }

  

  isPhoneNumberTouched(): boolean {
    return this.loginForm.get('phoneNumber')?.touched ?? false;
  }

  isOtpTouched(): boolean {
    return this.otpForm.get('otp')?.touched ?? false;
  }
}
