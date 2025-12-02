import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password?: string;
}

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-management.html',
  styleUrls: ['./profile-management.css']
})
export class ProfileManagementComponent implements OnInit {
  profileData: ProfileData = {
    name: 'Administrator',
    email: 'admin@epharmacy.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, Country',
    password: ''
  };

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Load profile data from service/API
    this.loadProfileData();
  }

  loadProfileData(): void {
    // TODO: Implement API call to load profile data
    // For now, using default data
  }

  onSubmit(): void {
    // Validate form
    if (!this.profileData.name || !this.profileData.phone) {
      this.toastService.show('Please fill in all required fields', 3000);
      return;
    }

    // TODO: Implement API call to update profile
    console.log('Profile data to update:', this.profileData);
    
    this.toastService.show('Profile updated successfully!', 3000);
    
    // Clear password field after submit
    this.profileData.password = '';
  }
}
