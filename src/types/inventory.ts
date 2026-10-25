export type SectionCategory =
  | 'BBQ Section'
  | 'Roll Section'
  | 'Naan Section'
  | 'Karahi Section'
  | 'Pizza & Fast Food'
  | 'Disposal Demand'
  | 'Vegetables & Misc'
  | 'Department Trackers';

export type SectionTabId =
  | 'all'
  | 'bbq'
  | 'roll'
  | 'naan'
  | 'karahi'
  | 'pizza_fastfood'
  | 'disposal'
  | 'vegetables_misc'
  | 'department_summary';

export interface ItemMaster {
  id: string;
  name: string;
  section: SectionCategory;
  subCategory?: string; // e.g. "Pizza" vs "Fast Food" or "Cartons"
  unit: string;
  currentStock: number;
  minThreshold: number;
  pendingDemand: number;
  estimatedPriceRs: number;
  lastUpdated: string;
  remarks?: string;
  popular?: boolean;
}

export interface SlipEntry {
  id: string;
  slipNumber: string;
  date: string; // YYYY-MM-DD
  itemName: string;
  category: SectionCategory;
  quantity: number;
  unit: string;
  priceRs: number; // Total Price in PKR Rs.
  unitPriceRs: number;
  remarks: string;
  loggedBy: string;
  status: 'Logged' | 'Verified' | 'Procured';
  timestamp: number;
}

export interface DepartmentTracker {
  id: string;
  name: string;
  leadPerson?: string;
  pendingItemsCount: number;
  estimatedTotalRs: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  lastLogDate: string;
  notes: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'store_manager';
  branch: string;
  avatarUrl?: string;
}

export type DateFilterType = 'daily' | 'monthly' | 'yearly';
