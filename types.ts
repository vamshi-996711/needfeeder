export enum DonationType {
  Food = 'Food',
  Clothes = 'Clothes',
  Money = 'Money',
  Essentials = 'Essentials',
}

export enum DonationStatus {
  Pending = 'Pending',
  Matched = 'Matched',
  PickedUp = 'Picked Up',
  Delivered = 'Delivered',
}

export enum VerificationStatus {
  Verified = 'Verified',
  Pending = 'Pending',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  password: string;
  location: {
    lat: number;
    lng: number;
  };
  specialties: DonationType[];
  verificationStatus: VerificationStatus;
}

export interface DonationItem {
  id: string;
  donorId: string;
  ngoId: string | null;
  volunteerId?: string | null;
  type: DonationType;
  description: string;
  quantity: string;
  status: DonationStatus;
  createdAt: string;
  imageUrl: string | null;
  donorName: string;
  location: {
    lat: number;
    lng: number;
  };
  volunteerLocation?: {
    lat: number;
    lng: number;
  };
}
