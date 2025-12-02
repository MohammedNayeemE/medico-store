import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Phone Number Validation', () => {
    it('should initialize login form with phone number starting with +91', () => {
      expect(component.loginForm.get('phoneNumber')?.value).toBe('+91');
    });

    it('should validate correct phone number format', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('+919876543210');
      expect(control?.valid).toBeTruthy();
    });

    it('should invalidate phone number without +91 prefix', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('9876543210');
      expect(control?.invalid).toBeTruthy();
    });

    it('should invalidate phone number with less than 10 digits', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('+91987654321');
      expect(control?.invalid).toBeTruthy();
    });

    it('should display error message for invalid phone number', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('invalid');
      control?.markAsTouched();
      expect(component.phoneNumberError).toBeTruthy();
    });
  });

  describe('OTP Form Validation', () => {
    it('should initialize OTP form with empty otp field', () => {
      expect(component.otpForm.get('otp')?.value).toBe('');
    });

    it('should validate 6-digit OTP', () => {
      const control = component.otpForm.get('otp');
      control?.setValue('123456');
      expect(control?.valid).toBeTruthy();
    });

    it('should invalidate OTP with less than 6 digits', () => {
      const control = component.otpForm.get('otp');
      control?.setValue('12345');
      expect(control?.invalid).toBeTruthy();
    });

    it('should invalidate OTP with non-numeric characters', () => {
      const control = component.otpForm.get('otp');
      control?.setValue('12345a');
      expect(control?.invalid).toBeTruthy();
    });

    it('should display error message for invalid OTP', () => {
      const control = component.otpForm.get('otp');
      control?.setValue('invalid');
      control?.markAsTouched();
      expect(component.otpError).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit login form with invalid phone number', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('invalid');
      component.onSubmitLogin();
      expect(component.isLoading).toBeFalsy();
    });

    it('should mark form as touched when submitting invalid form', () => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('invalid');
      component.onSubmitLogin();
      expect(control?.touched).toBeTruthy();
    });

    it('should show OTP form after successful phone submission', (done) => {
      const control = component.loginForm.get('phoneNumber');
      control?.setValue('+919876543210');
      component.onSubmitLogin();
      
      setTimeout(() => {
        expect(component.showOtpForm).toBeTruthy();
        done();
      }, 1600);
    });
  });

  describe('Modal Functionality', () => {
    it('should open terms modal', () => {
      component.openTermsModal();
      expect(component.showTermsModal).toBeTruthy();
    });

    it('should close terms modal', () => {
      component.openTermsModal();
      component.closeTermsModal();
      expect(component.showTermsModal).toBeFalsy();
    });

    it('should open privacy modal', () => {
      component.openPrivacyModal();
      expect(component.showPrivacyModal).toBeTruthy();
    });

    it('should close privacy modal', () => {
      component.openPrivacyModal();
      component.closePrivacyModal();
      expect(component.showPrivacyModal).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should go back to phone form from OTP form', () => {
      component.showOtpForm = true;
      component.onBackToPhoneForm();
      expect(component.showOtpForm).toBeFalsy();
    });

    it('should reset OTP form when going back to phone form', () => {
      const control = component.otpForm.get('otp');
      control?.setValue('123456');
      component.onBackToPhoneForm();
      expect(component.otpForm.get('otp')?.value).toBeNull();
    });
  });
});
