export type PetType = 'dog' | 'cat';
export type ReportType = 'lost' | 'found';
export type PetSize = 'small' | 'medium' | 'large';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface Reward {
  amount: number;
  description?: string;
}

export interface PetComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: PetComment[];
}

export interface PetReport {
  id: string;
  userId: string;
  pet_id: string;
  name?: string;
  type: PetType;
  breed?: string;
  color: string;
  size: PetSize;
  gender?: 'male' | 'female' | 'unknown';
  ageCategory: 'baby' | 'adult' | 'senior';
  description: string;
  photos: string[];
  reportType: ReportType;
  status: ReportStatus;
  isUrgent: boolean;
  dateReported: string;
  lastSeenDate?: string;
  lastSeenLocation?: Location;
  reward?: Reward;
  contactInfo: ContactInfo;
  tags: string[];
}

export interface UserReport {
  id: string;
  user_id: string;
  pet_id: string;
  report_type: ReportType;
  description: string;
  status: ReportStatus;
  created_at: string;
  pet_type: PetType;
  pet_name: string;
  pet_breed?: string;
  pet_color: string;
  pet_size: PetSize;
  pet_gender: 'male' | 'female' | 'unknown';
  pet_age?: 'baby' | 'adult' | 'senior';
  is_urgent: boolean;
  last_seen_location: Location;
  photos: string[];
  tags: string[];
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  content: string;
  petReportId: string;
  petName: string;
  petPhoto: string;
  userPhoto?: string;
  userName: string;
  date: string;
  likes: number;
  comments: number;
  photos: string[];
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
}