import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { AdminProfileService, AdminProfileResponse } from '../../services/admin-profile.service';
import { AuthService } from '../../services/auth.service';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profile_pic?: null | number;
  profile_pic_url?: string; // Add URL for display
  password?: string;
}

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-management.html',
  styleUrls: ['./profile-management.css'],
})
export class ProfileManagementComponent implements OnInit {
  private toastService = inject(ToastService);
  private adminProfileService = inject(AdminProfileService);
  private authService = inject(AuthService);

  // State management
  isLoading = signal(false);
  isSaving = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  profileData: ProfileData = {
    name: '',
    email: '',
    phone: '',
    profile_pic: null,
    profile_pic_url: '',
    password: '',
  };

  // Helper to get full image URL
  getProfilePicUrl(): string {
    if (this.profileData.profile_pic) {
      return `${this.getApiBaseUrl()}/files/assets/${this.profileData.profile_pic}`;
    }
    return '';
  }

  private getApiBaseUrl(): string {
    // Get base URL from environment (remove /profile suffix if present)
    const baseUrl = this.adminProfileService['API_BASE'];
    return baseUrl.replace('/profile', '');
  }

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading.set(true);

    // Get email from auth service
    const currentUser = this.authService.user();
    if (currentUser?.email) {
      this.profileData.email = currentUser.email;
    }

    this.adminProfileService.getAdminProfile().subscribe({
      next: (profile: AdminProfileResponse) => {
        this.profileData.name = profile.name;
        this.profileData.phone = profile.phone_number;
        this.profileData.profile_pic = profile.profile_pic || null;
        this.profileData.profile_pic_url = this.getProfilePicUrl();
        this.isLoading.set(false);
        console.log('Profile loaded:', profile);
        console.log('Profile pic URL:', this.profileData.profile_pic_url);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading.set(false);
        // If profile doesn't exist (404), that's okay - user can create one
        if (error.status === 404) {
          this.toastService.info('No profile found. Please create your profile.', 3000);
        }
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('File selected event triggered', input.files);

    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file', 3000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('File size must be less than 5MB', 3000);
        return;
      }

      this.selectedFile.set(file);
      console.log('File stored in selectedFile:', this.selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
        console.log('Preview URL created:', this.previewUrl()?.substring(0, 50) + '...');
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        this.toastService.error('Failed to read file', 3000);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    // Reset file input
    const fileInput = document.getElementById('profilePicInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    // Validate form
    if (!this.profileData.name || !this.profileData.phone) {
      this.toastService.warning('Please fill in all required fields', 3000);
      return;
    }

    this.isSaving.set(true);

    // Prepare profile data for update
    const updateData = {
      name: this.profileData.name,
      phone_number: this.profileData.phone,
      profile_pic: this.profileData.profile_pic,
    };

    // If there's a file selected, upload it first then update profile
    if (this.selectedFile() != null) {
      console.log('Uploading file with profile data:', updateData);
      this.adminProfileService.uploadAndUpdateProfile(this.selectedFile()!, updateData).subscribe({
        next: (response: AdminProfileResponse) => {
          console.log('Profile updated with picture:', response);
          this.profileData.name = response.name;
          this.profileData.phone = response.phone_number;
          this.profileData.profile_pic = response.profile_pic || null;
          this.profileData.profile_pic_url = this.getProfilePicUrl();
          this.isSaving.set(false);
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.profileData.password = '';
        },
        error: (error) => {
          console.error('Error updating profile with picture:', error);
          this.isSaving.set(false);
        },
      });
    } else {
      // Just update profile without uploading a new picture
      console.log('Updating profile without picture:', updateData);
      this.adminProfileService.updateAdminProfile(updateData).subscribe({
        next: (response: AdminProfileResponse) => {
          console.log('Profile updated:', response);
          this.profileData.name = response.name;
          this.profileData.phone = response.phone_number;
          this.profileData.profile_pic = response.profile_pic || null;
          this.profileData.profile_pic_url = this.getProfilePicUrl();
          this.isSaving.set(false);
          this.profileData.password = '';
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSaving.set(false);
        },
      });
    }
  }
}
