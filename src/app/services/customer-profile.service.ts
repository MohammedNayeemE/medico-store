import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type Gender = 'M' | 'F';

export interface CustomerProfileCreate {
  name?: string;
  email?: string;
  address_id?: number;
  profile_pic?: string;
  blood_group?: string;
  gender?: Gender;
  dob?: string;
}

export interface CustomerProfile extends CustomerProfileCreate {
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerProfileResponse {
  user_id: number;
  name?: string;
  email?: string;
  address_id?: number;
  profile_pic?: string;
  blood_group?: string;
  gender?: Gender;
  dob?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  address_id?: number;
  user_id?: number;
  house_no?: string;
  street_name?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  type_id?: number;
  is_deleted?: boolean;
  created_at?: string;
}

export interface AddressType {
  type_id: number;
  name: string;
  is_deleted?: boolean;
}

export interface AddressResponse {
  message: string;
  address_id: number;
  details: {
    formatted: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface FamilyMemberCreate {
  name: string;
  relation: string;
  phone_number: string | null;
  email: string | null;
  age: number | null;
  gender: Gender;
  dob: string | null;
}

export interface FamilyMemberUpdate {
  name?: string;
  relation?: string;
  phone_number?: string;
  email?: string;
  age?: number;
  gender?: Gender;
  dob?: string;
}

export interface FamilyMember extends FamilyMemberCreate {
  member_id: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerProfileService {
  private http = inject(HttpClient);
  private readonly API_BASE = `${environment.apiBaseUrl}/profile`;

  /**
   * Get customer profile information for the authenticated customer
   * @returns Observable of CustomerProfileResponse
   */
  getCustomerProfile(): Observable<CustomerProfileResponse> {
    return this.http.get<CustomerProfileResponse>(`${this.API_BASE}/get-customer-profile/`);
  }

  /**
   * Update customer profile information
   * @param profileData - Customer profile data to update
   * @returns Observable of CustomerProfile
   */
  updateCustomerProfile(profileData: CustomerProfileCreate): Observable<CustomerProfile> {
    return this.http.post<CustomerProfile>(
      `${this.API_BASE}/update_customer_profile`,
      profileData
    );
  }

  /**
   * Get all saved addresses for the authenticated customer
   * @returns Observable of Address array
   */
  getCustomerAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.API_BASE}/get-customer-addresses/`);
  }

  /**
   * Add a new address using latitude and longitude coordinates
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param type_id - Optional address type ID
   * @returns Observable of AddressResponse
   */
  addAddress(latitude: number, longitude: number, type_id?: number): Observable<AddressResponse> {
    let url = `${this.API_BASE}/add-address?latitude=${latitude}&longitude=${longitude}`;
    if (type_id !== undefined) {
      url += `&type_id=${type_id}`;
    }
    return this.http.post<AddressResponse>(url, {});
  }

  /**
   * Get all active address types
   * @returns Observable of AddressType array
   */
  getAddressTypes(): Observable<AddressType[]> {
    return this.http.get<AddressType[]>(`${this.API_BASE}/address-types`);
  }

  /**
   * Add a new family member for the authenticated customer
   * @param familyMemberData - Family member creation data
   * @returns Observable of FamilyMember
   */
  addFamilyMember(familyMemberData: FamilyMemberCreate): Observable<FamilyMember> {
    console.log(familyMemberData)
    return this.http.post<FamilyMember>(
      `${this.API_BASE}/add-family-member`,
      familyMemberData
    );
  }

  /**
   * Get all family members for the authenticated customer
   * @returns Observable of FamilyMember array
   */
  getFamilyMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.API_BASE}/get-family-memebers`);
  }

  /**
   * Update a family member by ID
   * @param memberId - Unique identifier of the family member
   * @param familyMemberData - Family member update data
   * @returns Observable of FamilyMember
   */
  updateFamilyMember(memberId: number, familyMemberData: FamilyMemberUpdate): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(
      `${this.API_BASE}/members/${memberId}`,
      familyMemberData
    );
  }
}
