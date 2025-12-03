import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
// import { environment } from '../../../environments/environment';

// CAPTCHA DISABLED - Uncomment below when needed
// declare global {
//   interface Window { grecaptcha: any }
// }

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.html',
  imports : [CommonModule , ReactiveFormsModule, LoadingScreenComponent] , 
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  loadingTitle = signal('Redirecting');
  loadingMessage = signal('Setting up your password reset...');
  // CAPTCHA DISABLED - Uncomment when needed
  // private readonly SITE_KEY = environment.recaptcha.siteKey;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // CAPTCHA DISABLED - Uncomment when needed
    // this.loadRecaptchaScript();
  }

  // CAPTCHA DISABLED - Uncomment when needed
  // private loadRecaptchaScript() {
  //   const id = 'recaptcha-v3-script';
  //   if (document.getElementById(id)) return;
  //   const script = document.createElement('script');
  //   script.id = id;
  //   script.src = `https://www.google.com/recaptcha/api.js?render=${this.SITE_KEY}`;
  //   script.async = true;
  //   document.body.appendChild(script);
  // }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePassword() {
    this.hidePassword.set(!this.hidePassword());
  }

  onForgotPassword() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.router.navigate(['/admin/reset-password']);
      this.isLoading.set(false);
    }, 2000);
  }

  async onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    try {
      this.isLoading.set(true);
      // CAPTCHA DISABLED - Uncomment when needed
      // const captchaToken = await this.executeRecaptcha('admin_login');
      const { email, password } = this.loginForm.value;
      this.auth.adminLogin({ 
        email, 
        password, 
        // CAPTCHA DISABLED - Uncomment when needed
        // captcha_token: captchaToken 
      }).subscribe({
        next: () => {
          this.toast.show('Login successful');
          this.router.navigate(['/admin/dashboard']);
          this.isLoading.set(false);
        },
        error: (err) => {
          const msg = err?.error?.detail || err?.message || 'Login failed';
          this.toast.show(msg);
          this.isLoading.set(false);
        }
      });
    } catch (e: any) {
      this.toast.show('Login failed. Please try again.');
      this.isLoading.set(false);
    }
  }

  // CAPTCHA DISABLED - Uncomment when needed
  // private executeRecaptcha(action: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const grecaptcha = window.grecaptcha;
  //     if (!grecaptcha || !grecaptcha.execute) {
  //       return reject('reCAPTCHA not loaded');
  //     }
  //     grecaptcha.ready(() => {
  //       grecaptcha.execute(this.SITE_KEY, { action }).then(resolve).catch(reject);
  //     });
  //   });
  // }
}
