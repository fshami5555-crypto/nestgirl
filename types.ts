
export enum UserStatus {
  SINGLE = 'عزباء',
  MARRIED = 'متزوجة',
  PREGNANT = 'حامل',
  MOTHER = 'أم'
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  password?: string; // Added password field
  dob: string;
  height: number;
  weight: number;
  status: UserStatus;
  maternalStatus?: string;
  pregnancyStartDate?: string;
  periodStartDate?: string;
  cycleLength?: number; // Default typically 28
  isCycleRegular?: boolean;
  isAdmin?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: any;
  likes: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: 'skin' | 'family' | 'fitness';
  imageUrl: string;
  timestamp: any;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: any[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  address: string;
  city: string;
  phone: string;
  timestamp: any;
}
