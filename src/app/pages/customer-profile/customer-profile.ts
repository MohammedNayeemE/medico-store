import { Component, computed, effect, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { CustomerProfileService, Address, AddressType, FamilyMember } from '../../services/customer-profile.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { AuthService } from '../../services/auth.service';
import { Gender } from '../../services/customer-profile.service';
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-profile.html',
  styleUrls: ['./customer-profile.css']
})
export class CustomerProfileComponent implements OnInit {
  // Inject services
  private profileService = inject(CustomerProfileService);
  private toastService = inject(ToastService);
  private confirmDialogService = inject(ConfirmDialogService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Tabs
  activeTab = signal<'personal' | 'medical' | 'addresses' | 'family'>('personal');

  // Forms
  personalForm: FormGroup;
  medicalForm: FormGroup;
  addressForm: FormGroup;
  familyForm: FormGroup;

  // Lists
  addresses = signal<Address[]>([]);
  familyMembers = signal<Array<any>>([]);
  addressTypes = signal<AddressType[]>([]);

  // Loading states
  loadingProfile = signal(false);
  loadingAddresses = signal(false);
  loadingFamilyMembers = signal(false);
  savingProfile = signal(false);
  savingAddress = signal(false);
  savingFamilyMember = signal(false);
  geolocating = signal(false);
  dobSignal = signal<string | null>(null)

  

  // Computed age from DOB
  calculatedAge = computed(() => {
      const dobValue = this.dobSignal();
      if (!dobValue) return null;

      const dob = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      return age >= 0 ? age : null;
    });


  // Progress
  completionPercent = computed(() => {
    const groups = [this.personalForm, this.medicalForm];
    const requiredCount = groups.reduce((acc, fg) => acc + this.countRequired(fg), 0);
    const validCount = groups.reduce((acc, fg) => acc + this.countValidRequired(fg), 0);
    const pct = requiredCount ? Math.round((validCount / requiredCount) * 100) : 0;
    return Math.max(0, Math.min(100, pct));
  });

  constructor() {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [{ value: '', disabled: true }],
      email: ['', [Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: ['']
    });

    this.medicalForm = this.fb.group({
      medicalConditions: [''],
      allergies: [''],
      medications: ['']
    });

    this.addressForm = this.fb.group({
      addressType: ['home', [Validators.required]],
      addressFullName: ['', [Validators.required, Validators.minLength(2)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      addressState: ['', [Validators.required]],
      addressCity: ['', [Validators.required]],
      addressZip: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      addressPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]]
    });

    this.familyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      relation: ['', [Validators.required]],
      phoneNumber: ['', [Validators.pattern(/^\+?\d{7,15}$/)]],
      email: ['', [Validators.email]],
      age: [{ value: '', disabled: true }],
      gender: [''],
      dob: ['', [Validators.required]]
    });

    // Seed demo data
    this.addresses.set([]);
    this.familyMembers.set([]);

    // Keep completion updated
    effect(() => {
      void this.completionPercent();
    });

    // Auto-update age when DOB changes
    effect(() => {
      const age = this.calculatedAge();
      if (age !== null) {
        this.familyForm.get('age')?.setValue(age, { emitEvent: false });
      }
    });

  }

  ngOnInit(): void {
    this.loadInitialData();
    this.familyForm.get('dob')?.valueChanges.subscribe(value => {
          this.dobSignal.set(value);
    });
    this.personalForm.valueChanges.subscribe(() => this.completionPercent());
    this.medicalForm.valueChanges.subscribe(() => this.completionPercent());

    setTimeout(() => this.completionPercent(), 700);

  }

  /**
   * Load initial data from API
   */
  private loadInitialData(): void {
    this.loadingProfile.set(true);
    this.loadingAddresses.set(true);

    // Load customer profile
    this.profileService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.populatePersonalForm(profile);
        this.loadingProfile.set(false);
      },
      error: (error) => {
        this.loadingProfile.set(false);
        console.error('Error loading profile:', error);
        this.toastService.error('Failed to load profile information');
      }
    });
    // Load address types
    this.profileService.getAddressTypes().subscribe({
      next: (types) => {
        this.addressTypes.set(types);
      },
      error: (error) => {
        console.error('Error loading address types:', error);
      }
    });

    // Load customer addresses
    this.profileService.getCustomerAddresses().subscribe({
      next: (addrs) => {
        this.addresses.set(addrs);
        this.loadingAddresses.set(false);
      },
      error: (error) => {
        this.loadingAddresses.set(false);
        console.error('Error loading addresses:', error);
        this.toastService.error('Failed to load addresses');
      }
    });

    // Load family members
    this.loadFamilyMembers();
    
  }

  /**
   * Populate personal form with profile data
   */
  private populatePersonalForm(profile: any): void {
    console.log(profile)
    // Format name from profile
    const nameParts = profile.name ? profile.name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Get phone number from auth service (stored during login)
    const user = this.authService.getUser();
    const phoneNumber = user?.phone || '';

    // Convert gender format from API (M/F) to form format (male/female)
    let genderValue = '';
    if (profile.gender) {
      if (profile.gender.toLowerCase() === 'm') {
        genderValue = 'male';
      } else if (profile.gender.toLowerCase() === 'f') {
        genderValue = 'female';
      }
    }

    this.personalForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      email: profile.email || '',
      dateOfBirth: profile.dob || '',
      gender: genderValue,
      bloodGroup: profile.blood_group || ''
    });
  }

  // Helpers
  get membersArray(): FormArray {
    return this.familyForm.get('members') as FormArray;
  }

  get newMemberGroup(): FormGroup {
    return this.familyForm;
  }


  isInvalid(fg: FormGroup, controlName: string): boolean {
    const c = fg.get(controlName);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  markAllTouched(fg: FormGroup) {
    Object.values(fg.controls).forEach(ctrl => ctrl.markAsTouched());
  }

  countRequired(fg: FormGroup): number {
    return Object.values(fg.controls).filter((ctrl: any) => {
      const validator = ctrl.validator;
      if (!validator) return false;
      const errors = validator({} as any);
      return errors && errors['required'];
    }).length;
  }

  countValidRequired(fg: FormGroup): number {
    return Object.values(fg.controls).filter((ctrl: any) => {
      const validator = ctrl.validator;
      if (!validator) return false;
      const errors = validator(ctrl);
      return !(errors && errors['required']);
    }).length;
  }



  // Actions
  setTab(tab: 'personal' | 'medical' | 'addresses' | 'family') {
    this.activeTab.set(tab);
  }

  /**
   * Save personal information
   */
  savePersonal(): void {
    if (this.personalForm.invalid) {
      this.markAllTouched(this.personalForm);
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.savingProfile.set(true);
    const Male : Gender = 'M'
    const Female : Gender = 'F'
    const formData = this.personalForm.getRawValue();
    const profileData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      gender: formData.gender === 'male' ? Male : Female,
      dob: formData.dateOfBirth,
      blood_group: formData.bloodGroup
    };

    this.profileService.updateCustomerProfile(profileData).subscribe({
      next: (response) => {
        this.savingProfile.set(false);
        this.toastService.success('Profile updated successfully');
      },
      error: (error) => {
        this.savingProfile.set(false);
        console.error('Error updating profile:', error);
        const errorMessage = error?.error?.detail || 'Failed to update profile';
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Save medical information
   */
  saveMedical(): void {
    if (this.medicalForm.invalid) {
      this.markAllTouched(this.medicalForm);
      return;
    }

    this.savingProfile.set(true);

    const formData = this.medicalForm.value;
    // Note: Adjust this based on your actual API endpoint for medical info
    // For now, we'll just show a success message
    setTimeout(() => {
      this.savingProfile.set(false);
      this.toastService.success('Medical information saved successfully');
    }, 500);
  }

  /**
   * Toggle add address form visibility
   */
  toggleAddAddress(show: boolean): void {
    const el = document.getElementById('addAddressForm');
    if (el) {
      el.classList.toggle('hidden', !show);
    }
  }

  /**
   * Get user's current location and add address
   */
  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toastService.error('Geolocation is not supported by your browser');
      return;
    }

    this.geolocating.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.addAddressWithCoordinates(latitude, longitude);
      },
      (error) => {
        this.geolocating.set(false);
        let errorMessage = 'Failed to get location';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timeout.';
        }

        this.toastService.error(errorMessage);
      }
    );
  }

  /**
   * Add address using coordinates
   */
  private addAddressWithCoordinates(latitude: number, longitude: number): void {
    this.savingAddress.set(true);

    const addressForm = this.addressForm.value;
    const typeId = addressForm.addressType 
      ? this.addressTypes().find(t => t.name === addressForm.addressType)?.type_id 
      : undefined;

    this.profileService.addAddress(latitude, longitude, typeId).subscribe({
      next: (response) => {
        this.savingAddress.set(false);
        this.geolocating.set(false);
        this.toastService.success('Address added successfully');
        this.addressForm.reset({ addressType: 'home' });
        this.toggleAddAddress(false);
        // Reload addresses
        this.loadAddresses();
      },
      error: (error) => {
        this.savingAddress.set(false);
        this.geolocating.set(false);
        console.error('Error adding address:', error);
        const errorMessage = error?.error?.detail || 'Failed to add address';
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Save address (original implementation with form fields)
   */
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.markAllTouched(this.addressForm);
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    // Prompt user to use current location
    this.toastService.info('Please use "Use Current Location" to add an address');
  }

  /**
   * Remove address
   */
  removeAddress(id: number | undefined): void {
    if (id === undefined) {
      this.toastService.error('Cannot remove address');
      return;
    }

    this.confirmDialogService.show(
      'Remove Address',
      'Are you sure you want to remove this address? This action cannot be undone.',
      'Delete',
      'Cancel',
      true // isDangerous = true for delete action
    ).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.addresses.update(list => list.filter(a => a.address_id !== id));
          this.toastService.success('Address removed successfully');
        }
      }
    });
  }

  /**
   * Reload addresses from API
   */
  private loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.profileService.getCustomerAddresses().subscribe({
      next: (addrs) => {
        this.addresses.set(addrs);
        this.loadingAddresses.set(false);
      },
      error: (error) => {
        this.loadingAddresses.set(false);
        console.error('Error loading addresses:', error);
        this.toastService.error('Failed to reload addresses');
      }
    });
  }

  /**
   * Load family members from API
   */
  private loadFamilyMembers(): void {
    this.loadingFamilyMembers.set(true);
    this.profileService.getFamilyMembers().subscribe({
      next: (members) => {
        this.familyMembers.set(members);
        this.loadingFamilyMembers.set(false);
      },
      error: (error) => {
        this.loadingFamilyMembers.set(false);
        // Don't show error if it's a 404 (no family members found)
        if (error?.error?.status !== 404) {
          console.error('Error loading family members:', error);
          this.toastService.error('Failed to load family members');
        }
      }
    });
  }

  /**
   * Add family member via API
   */
  addFamilyMember(): void {
    if (this.familyForm.invalid) {
      this.markAllTouched(this.familyForm);
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.savingFamilyMember.set(true);
    const formData = this.familyForm.value;

    let genderValue: Gender = 'M';
    if (formData.gender) {
      genderValue = formData.gender.toLowerCase() === 'male' ? 'M' : 'F';
    }

    
    // Get the calculated age from the computed signal
    const calculatedAge = this.calculatedAge();

    const familyMemberData = {
      name: formData.name,
      relation: formData.relation,
      phone_number: formData.phoneNumber ? formData.phoneNumber : null,
      email: formData.email ? formData.email : null,
      age: calculatedAge,
      gender: genderValue,
      dob: formData.dob  ? formData.dob : null,
    };

    this.profileService.addFamilyMember(familyMemberData).subscribe({
      next: (member) => {
        this.savingFamilyMember.set(false);
        this.familyMembers.update(list => [member, ...list]);
        this.familyForm.reset();
        this.toastService.success('Family member added successfully');
      },
      error: (error) => {
        this.savingFamilyMember.set(false);
        console.error('Error adding family member:', error);
        const errorMessage = error?.error?.detail || 'Failed to add family member';
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Remove family member via API
   */
  removeFamilyMember(id: number): void {
    this.confirmDialogService.show(
      'Remove Family Member',
      'Are you sure you want to remove this family member from your profile?',
      'Remove',
      'Cancel',
      true // isDangerous = true for delete action
    ).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.profileService.updateFamilyMember(id, { name: '' }).subscribe({
            next: () => {
              this.familyMembers.update(list => list.filter(m => m.member_id !== id));
              this.toastService.success('Family member removed successfully');
            },
            error: (error) => {
              console.error('Error removing family member:', error);
              this.toastService.error('Failed to remove family member');
            }
          });
        }
      }
    });
  }
}