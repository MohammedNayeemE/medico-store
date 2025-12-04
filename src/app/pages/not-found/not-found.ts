import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFoundComponent implements OnInit {
  countdown = 10;
  private countdownInterval?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Auto-redirect countdown
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  /**
   * Start countdown timer for auto-redirect
   */
  private startCountdown(): void {
    this.countdownInterval = window.setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goHome();
      }
    }, 1000);
  }

  /**
   * Navigate back to home page
   */
  goHome(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/']);
  }

  /**
   * Navigate back to previous page
   */
  goBack(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    window.history.back();
  }
}
