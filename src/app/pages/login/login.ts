import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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

    // Simulate OTP sending
    setTimeout(() => {
      console.log('OTP sent to:', phoneNumber);
      this.showOtpForm.set(true);
      this.isLoading.set(false);
    }, 1000);
  }

  onSubmitOtp(): void {
    if (this.otpForm.invalid) {
      this.markFormGroupTouched(this.otpForm);
      return;
    }

    this.isLoading.set(true);
    const otp = this.otpForm.get('otp')?.value;
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;

    // Simulate OTP verification
    setTimeout(() => {
      // Mock successful verification - in real app, verify with backend
      const mockUser: User = {
        isAuthenticated: true,
        email: `user${phoneNumber.slice(-10)}@medico.com`,
        name: 'User',
        roles: ['customer']
      };

      this.authService.login(mockUser);
      this.isLoading.set(false);

      // Navigate to home
      this.router.navigate(['/']);
    }, 1000);
  }

  onBackToPhoneForm(): void {
    this.showOtpForm.set(false);
    this.otpForm.reset();
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
