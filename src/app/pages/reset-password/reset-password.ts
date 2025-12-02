import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingScreenComponent],
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  hideNewPassword = true;
  hideReenterPassword = true;
  isLoading = false;
  loadingTitle = 'Updating Password';
  loadingMessage = 'Your password is being updated...';
  passwordStrength = {
    length: false,
    digit: false,
    uppercase: false,
    lowercase: false,
    special: false
  };

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      reenterPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.resetForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get reenterPassword() {
    return this.resetForm.get('reenterPassword');
  }

  updatePasswordStrength() {
    const password = this.newPassword?.value || '';
    
    this.passwordStrength.length = password.length >= 8;
    this.passwordStrength.digit = /\d/.test(password);
    this.passwordStrength.uppercase = /[A-Z]/.test(password);
    this.passwordStrength.lowercase = /[a-z]/.test(password);
    this.passwordStrength.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Update confirm password validation
    if (this.reenterPassword?.value) {
      this.resetForm.get('reenterPassword')?.updateValueAndValidity({ emitEvent: false });
    }
  }

  toggleNewPassword() {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleReenterPassword() {
    this.hideReenterPassword = !this.hideReenterPassword;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const reenterPassword = control.get('reenterPassword')?.value;

    if (!newPassword || !reenterPassword) {
      return null;
    }

    return newPassword === reenterPassword ? null : { passwordMismatch: true };
  }

  isPasswordValid(): boolean {
    return (
      this.passwordStrength.length &&
      this.passwordStrength.digit &&
      this.passwordStrength.uppercase &&
      this.passwordStrength.lowercase &&
      this.passwordStrength.special
    );
  }

  onSubmit() {
    if (this.resetForm.valid && this.isPasswordValid()) {
      this.isLoading = true;
      // Simulate API call with 2 second delay
      setTimeout(() => {
        console.log('Reset password:', this.resetForm.value);
        this.isLoading = false;
        // You can add navigation or success message here
      }, 2000);
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}