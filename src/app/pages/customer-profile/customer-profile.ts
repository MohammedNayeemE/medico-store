import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-profile.html',
  styleUrls: ['./customer-profile.css']
})
export class CustomerProfileComponent {
  // Tabs
  activeTab = signal<'personal' | 'medical' | 'addresses' | 'family'>('personal');

  // Forms
  personalForm: FormGroup;
  medicalForm: FormGroup;
  addressForm: FormGroup;
  familyForm: FormGroup;

  // Lists
  addresses = signal<Array<any>>([]);
  familyMembers = signal<Array<any>>([]);

  // Progress
  completionPercent = computed(() => {
    const groups = [this.personalForm, this.medicalForm];
    const requiredCount = groups.reduce((acc, fg) => acc + this.countRequired(fg), 0);
    const validCount = groups.reduce((acc, fg) => acc + this.countValidRequired(fg), 0);
    const pct = requiredCount ? Math.round((validCount / requiredCount) * 100) : 0;
    return Math.max(0, Math.min(100, pct));
  });

  constructor(private fb: FormBuilder) {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [{ value: '+91 98765 43210', disabled: true }],
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
      members: this.fb.array([]),
      newMember: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        relation: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        gender: ['', [Validators.required]]
      })
    });

    // Seed demo data
    this.addresses.set([]);
    this.familyMembers.set([]);

    // Keep completion updated
    effect(() => {
      // triggers when completionPercent changes
      void this.completionPercent();
    });
  }

  // Helpers
  get membersArray(): FormArray {
    return this.familyForm.get('members') as FormArray;
  }

  get newMemberGroup(): FormGroup {
    return this.familyForm.get('newMember') as FormGroup;
}


  isInvalid(fg: FormGroup, controlName: string): boolean {
    const c = fg.get(controlName);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  markAllTouched(fg: FormGroup) {
    Object.values(fg.controls).forEach(ctrl => ctrl.markAsTouched());
  }

  countRequired(fg: FormGroup): number {
    return Object.values(fg.controls).filter((c: any) => c.hasValidator && c.hasValidator(Validators.required)).length;
  }

  countValidRequired(fg: FormGroup): number {
    return Object.values(fg.controls).filter((c: any) => c.hasValidator && c.hasValidator(Validators.required) && c.valid).length;
  }

  // Actions
  setTab(tab: 'personal' | 'medical' | 'addresses' | 'family') {
    this.activeTab.set(tab);
  }

  savePersonal() {
    if (this.personalForm.invalid) {
      this.markAllTouched(this.personalForm);
      return;
    }
    // TODO: Integrate API
    console.log('Personal saved', this.personalForm.getRawValue());
  }

  saveMedical() {
    if (this.medicalForm.invalid) {
      this.markAllTouched(this.medicalForm);
      return;
    }
    console.log('Medical saved', this.medicalForm.value);
  }

  toggleAddAddress(show: boolean) {
    const el = document.getElementById('addAddressForm');
    if (el) {
      el.classList.toggle('hidden', !show);
    }
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.markAllTouched(this.addressForm);
      return;
    }
    const newAddr = { ...this.addressForm.value, id: Date.now() };
    this.addresses.update(list => [newAddr, ...list]);
    this.addressForm.reset({ addressType: 'home' });
    this.toggleAddAddress(false);
  }

  removeAddress(id: number) {
    this.addresses.update(list => list.filter(a => a.id !== id));
  }

  addFamilyMember() {
    const fg = this.familyForm.get('newMember') as FormGroup;
    if (fg.invalid) {
      this.markAllTouched(fg);
      return;
    }
    const m = { ...fg.value, id: Date.now() };
    this.familyMembers.update(list => [m, ...list]);
    fg.reset();
  }

  removeFamilyMember(id: number) {
    this.familyMembers.update(list => list.filter(m => m.id !== id));
  }
}
