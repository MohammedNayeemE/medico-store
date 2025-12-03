import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

// Interfaces matching the API responses
export interface AdminProfileResponse {
  user_id: number;
  name: string;
  phone_number: string;
  profile_pic?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProfileCreate {
  name?: string;
  phone_number?: string;
  profile_pic?: number | null;
}

export interface UploadProfilePicResponse {
  file_url: string;
  profile_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  
  private readonly API_BASE = `${environment.apiBaseUrl}/profile`;

  constructor() {}

  /**
   * Get the authenticated admin's profile
   * Requires: profile:read scope
   */
  getAdminProfile(): Observable<AdminProfileResponse> {
    return this.http.get<AdminProfileResponse>(`${this.API_BASE}/get-admin-profile/`).pipe(
      catchError(error => {
        this.handleError('Failed to load profile', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload or replace admin profile picture
   * Requires: profile:write scope
   */
  uploadProfilePicture(file: File): Observable<UploadProfilePicResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadProfilePicResponse>(
      `${this.API_BASE}/upload-profile-pic/`,
      formData
    ).pipe(
      tap(response => {
        this.toastService.success('Profile picture uploaded successfully', 3000);
      }),
      catchError(error => {
        this.handleError('Failed to upload profile picture', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update admin profile information
   * Requires: profile:update scope
   */
  updateAdminProfile(profileData: AdminProfileCreate): Observable<AdminProfileResponse> {
    return this.http.post<AdminProfileResponse>(
      `${this.API_BASE}/update-admin-profile/`,
      profileData
    ).pipe(
      tap(response => {
        this.toastService.success('Profile updated successfully', 3000);
      }),
      catchError(error => {
        this.handleError('Failed to update profile', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload profile picture and update profile in one flow
   * This is a convenience method that combines upload and update
   */
  uploadAndUpdateProfile(file: File, profileData: AdminProfileCreate): Observable<AdminProfileResponse> {
    return new Observable(observer => {
      console.log('Starting file upload...');
      this.uploadProfilePicture(file).subscribe({
        next: (uploadResponse) => {
          console.log('Upload response:', uploadResponse);
          // Update profile data with the new profile picture ID
          const updatedData: AdminProfileCreate = {
            ...profileData,
            profile_pic: Number(uploadResponse.profile_id) // Use profile_id, not file_url
          };
          
          console.log('Updating profile with data:', updatedData);
          this.updateAdminProfile(updatedData).subscribe({
            next: (profileResponse) => {
              console.log('Profile update response:', profileResponse);
              observer.next(profileResponse);
              observer.complete();
            },
            error: (error) => {
              console.error('Profile update error:', error);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          console.error('File upload error:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Handle errors and show appropriate toast messages
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    
    // Check for specific error codes
    if (error.status === 403) {
      this.toastService.error('Access forbidden: Insufficient permissions', 4000);
    } else if (error.status === 404) {
      this.toastService.error('Profile not found', 3000);
    } else if (error.status === 429) {
      this.toastService.error('Too many requests. Please try again later', 4000);
    } else if (error.status === 500) {
      this.toastService.error('Server error. Please try again later', 4000);
    } else if (error.error?.detail) {
      this.toastService.error(error.error.detail, 4000);
    } else {
      this.toastService.error(message, 3000);
    }
  }
}
