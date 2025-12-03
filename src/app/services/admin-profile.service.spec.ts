// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { AdminProfileService, AdminProfileResponse, AdminProfileCreate } from './admin-profile.service';
// import { ToastService } from './toast.service';
// import { environment } from '../../environments/environment';

// describe('AdminProfileService', () => {
//   let service: AdminProfileService;
//   let httpMock: HttpTestingController;
//   let toastService: jasmine.SpyObj<ToastService>;

//   const mockAdminProfile: AdminProfileResponse = {
//     user_id: 1,
//     name: 'Some user',
//     phone_number: '+1234567890',
//     profile_pic: 'http://localhost:8000/api/v1/files/assets/1',
//     created_at: '2024-01-01T00:00:00Z',
//     updated_at: '2024-01-02T00:00:00Z'
//   };

//   beforeEach(() => {
//     const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [
//         AdminProfileService,
//         { provide: ToastService, useValue: toastServiceSpy }
//       ]
//     });

//     service = TestBed.inject(AdminProfileService);
//     httpMock = TestBed.inject(HttpTestingController);
//     toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   describe('getAdminProfile', () => {
//     it('should retrieve admin profile', (done) => {
//       service.getAdminProfile().subscribe({
//         next: (profile) => {
//           expect(profile).toEqual(mockAdminProfile);
//           done();
//         }
//       });

//       const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/get-admin-profile/`);
//       expect(req.request.method).toBe('GET');
//       req.flush(mockAdminProfile);
//     });

//     it('should handle 404 error', (done) => {
//       service.getAdminProfile().subscribe({
//         error: (error) => {
//           expect(error.status).toBe(404);
//           expect(toastService.error).toHaveBeenCalledWith('Profile not found', 3000);
//           done();
//         }
//       });

//       const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/get-admin-profile/`);
//       req.flush('Profile not found', { status: 404, statusText: 'Not Found' });
//     });

//     it('should handle 403 forbidden error', (done) => {
//       service.getAdminProfile().subscribe({
//         error: (error) => {
//           expect(error.status).toBe(403);
//           expect(toastService.error).toHaveBeenCalledWith('Access forbidden: Insufficient permissions', 4000);
//           done();
//         }
//       });

//       const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/get-admin-profile/`);
//       req.flush('Forbidden Access', { status: 403, statusText: 'Forbidden' });
//     });
//   });

//   describe('uploadProfilePicture', () => {
//     it('should upload profile picture successfully', (done) => {
//       const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
//       const mockResponse = {
//         file_url: 'http://localhost:8000/api/v1/files/assets/456',
//         profile_id: '456'
//       };

//       service.uploadProfilePicture(mockFile).subscribe({
//         next: (response) => {
//           expect(response).toEqual(mockResponse);
//           expect(toastService.success).toHaveBeenCalledWith('Profile picture uploaded successfully', 3000);
//           done();
//         }
//       });

//       const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/upload-profile-pic/`);
//       expect(req.request.method).toBe('POST');
//       expect(req.request.body instanceof FormData).toBeTruthy();
//       req.flush(mockResponse);
//     });
//   });

//   describe('updateAdminProfile', () => {
//     it('should update admin profile successfully', (done) => {
//       const updateData: AdminProfileCreate = {
//         name: 'Jane Doe',
//         phone_number: '+9876543210'
//       };

//       service.updateAdminProfile(updateData).subscribe({
//         next: (profile) => {
//           expect(profile.name).toBe('Jane Doe');
//           expect(toastService.success).toHaveBeenCalledWith('Profile updated successfully', 3000);
//           done();
//         }
//       });

//       const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/update-admin-profile/`);
//       expect(req.request.method).toBe('POST');
//       expect(req.request.body).toEqual(updateData);
//       req.flush({ ...mockAdminProfile, ...updateData });
//     });
//   });

//   describe('uploadAndUpdateProfile', () => {
//     it('should upload picture and update profile in sequence', (done) => {
//       const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
//       const profileData: AdminProfileCreate = {
//         name: 'John Doe',
//         phone_number: '+1234567890'
//       };

//       const uploadResponse = {
//         file_url: 'http://localhost:8000/api/v1/files/assets/789',
//         profile_id: '789'
//       };

//       service.uploadAndUpdateProfile(mockFile, profileData).subscribe({
//         next: (profile) => {
//           expect(profile.profile_pic).toBe(uploadResponse.file_url);
//           done();
//         }
//       });

//       // First request: upload
//       const uploadReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/upload-profile-pic/`);
//       uploadReq.flush(uploadResponse);

//       // Second request: update profile
//       const updateReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/profile/update-admin-profile/`);
//       expect(updateReq.request.body.profile_pic).toBe(uploadResponse.file_url);
//       updateReq.flush({ ...mockAdminProfile, ...profileData, profile_pic: uploadResponse.file_url });
//     });
//   });
// });
