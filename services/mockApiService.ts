import { DonationItem, DonationStatus, DonationType, NGO, User, VerificationStatus } from '../types';

const USERS_KEY = 'need-feeder-users';
const NGOS_KEY = 'need-feeder-ngos';
const DONATIONS_KEY = 'need-feeder-donations';

const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Akash Goud', email: 'akash@test.com', password: 'password123', location: { lat: 17.3850, lng: 78.4867 } },
  { id: 'user-2', name: 'Vinesh Goud', email: 'vinesh@test.com', password: 'password123', location: { lat: 17.4375, lng: 78.4483 } },
];

const MOCK_NGOS: NGO[] = [
  { id: 'ngo-1', name: 'Hope Foundation', email: 'hope@test.com', password: 'password123', location: { lat: 17.4130, lng: 78.4840 }, specialties: [DonationType.Food, DonationType.Clothes], verificationStatus: VerificationStatus.Verified },
  { id: 'ngo-2', name: 'Charity Connect', email: 'charity@test.com', password: 'password123', location: { lat: 17.4500, lng: 78.4200 }, specialties: [DonationType.Essentials, DonationType.Money], verificationStatus: VerificationStatus.Verified },
  { id: 'ngo-3', name: 'Goodwill Shelter', email: 'goodwill@test.com', password: 'password123', location: { lat: 17.3616, lng: 78.4747 }, specialties: [DonationType.Food, DonationType.Essentials], verificationStatus: VerificationStatus.Pending },
  { id: 'ngo-4', name: 'Helping Hands', email: 'helping@test.com', password: 'password123', location: { lat: 17.3845, lng: 78.4870 }, specialties: [DonationType.Clothes, DonationType.Essentials], verificationStatus: VerificationStatus.Verified },
];

const MOCK_DONATIONS: DonationItem[] = [
    {
      id: 'don-1',
      donorId: 'user-1',
      ngoId: 'ngo-1',
      type: DonationType.Food,
      description: '10kg Rice and Dal',
      quantity: '2 bags',
      status: DonationStatus.Delivered,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://picsum.photos/seed/food1/400/300',
      donorName: 'Akash Goud',
      location: { lat: 17.3850, lng: 78.4867 },
    },
    {
        id: 'don-2',
        donorId: 'user-2',
        ngoId: null,
        type: DonationType.Clothes,
        description: 'Warm blankets and sweaters for winter.',
        quantity: '5 boxes',
        status: DonationStatus.Pending,
        createdAt: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/seed/clothes1/400/300',
        donorName: 'Vinesh Goud',
        location: { lat: 17.4375, lng: 78.4483 },
    },
    {
        id: 'don-3',
        donorId: 'user-1',
        ngoId: 'ngo-4',
        type: DonationType.Essentials,
        description: 'Sanitary pads and soaps.',
        quantity: '1 large box',
        status: DonationStatus.PickedUp,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://picsum.photos/seed/essentials1/400/300',
        donorName: 'Akash Goud',
        location: { lat: 17.3850, lng: 78.4867 },
    }
]

const initializeData = <T,>(key: string, mockData: T[]): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(mockData));
      return mockData;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error(`Failed to initialize ${key}`, e);
    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
  }
};

initializeData(USERS_KEY, MOCK_USERS);
initializeData(NGOS_KEY, MOCK_NGOS);
initializeData(DONATIONS_KEY, MOCK_DONATIONS);


export const loginUser = (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
};
  
export const loginNgo = (email: string, password: string): NGO | null => {
    const ngos = JSON.parse(localStorage.getItem(NGOS_KEY) || '[]') as NGO[];
    const ngo = ngos.find(n => n.email.toLowerCase() === email.toLowerCase() && n.password === password);
    return ngo || null;
};


export const getDonations = (): DonationItem[] => {
  const donations = JSON.parse(localStorage.getItem(DONATIONS_KEY) || '[]');
  return donations.sort((a: DonationItem, b: DonationItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addDonation = (donation: Omit<DonationItem, 'id' | 'createdAt'>): DonationItem => {
  const donations = getDonations();
  const newDonation: DonationItem = {
    ...donation,
    id: `don-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  donations.unshift(newDonation);
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
  return newDonation;
};

export const updateDonationStatus = (donationId: string, status: DonationStatus, ngoId?: string): DonationItem | undefined => {
  let donations = getDonations();
  const donationIndex = donations.findIndex(d => d.id === donationId);
  if (donationIndex > -1) {
    donations[donationIndex].status = status;
    if (ngoId && status === DonationStatus.Matched) {
      donations[donationIndex].ngoId = ngoId;
    }
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
    return donations[donationIndex];
  }
  return undefined;
};

export const getNgos = (): NGO[] => {
    return JSON.parse(localStorage.getItem(NGOS_KEY) || '[]');
};

export const getNgoById = (id: string): NGO | undefined => {
    const ngos = getNgos();
    return ngos.find(n => n.id === id);
}

export const getUserById = (id: string): User | undefined => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
    return users.find(u => u.id === id);
}

const haversineDistance = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};


export const findNearbyNgos = (donorLocation: { lat: number, lng: number }, radiusKm: number = 5): NGO[] => {
    const allNgos = getNgos();
    const verifiedNgos = allNgos.filter(n => n.verificationStatus === VerificationStatus.Verified);
    
    return verifiedNgos.filter(ngo => {
        const distance = haversineDistance(donorLocation, ngo.location);
        return distance <= radiusKm;
    });
};
