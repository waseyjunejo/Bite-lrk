import { ItemMaster, SlipEntry, DepartmentTracker } from '../types/inventory';

export const RESTAURANT_METADATA = {
  name: 'Bite Restaurant Larkana',
  tagline: 'Inventory, Stock & Kitchen Slip Demand System',
  branch: 'Station Road / Vip Road, Larkana, Sindh',
  phone: '+92 74 4056789',
  manager: 'IB Junejo (Store Manager)',
  admin: 'Executive Admin',
};

// All items exactly specified from paper slips organized by Section (Clean Zero Base - No Fake Stock/Values)
export const INITIAL_ITEM_MASTER: ItemMaster[] = [
  // ================= A. BBQ SECTION =================
  { id: 'bbq-1', name: 'Jeero', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-2', name: 'Kara Mirch', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-3', name: 'Sooka Dhaniya', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-4', name: 'Garha Mirch', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-5', name: 'Namak', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-6', name: 'Sookhi Toor', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-7', name: 'Godamri', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-8', name: 'Kareer', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-9', name: 'Ghee', section: 'BBQ Section', unit: 'Tin (16 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-10', name: 'Sirko Kalo', section: 'BBQ Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-11', name: 'National Chaat Masala', section: 'BBQ Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-12', name: 'Ajino', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-13', name: 'Acha Mirch', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-14', name: 'Peelo Rang', section: 'BBQ Section', unit: 'Bottle/Pkt', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-15', name: 'Meethi', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-16', name: 'Adrak', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-17', name: 'Brown Pyaz', section: 'BBQ Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-18', name: 'National Ketchup Bottle', section: 'BBQ Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'bbq-19', name: 'Sirko Bottle', section: 'BBQ Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= B. ROLL SECTION =================
  { id: 'roll-1', name: 'Meedo Atta', section: 'Roll Section', unit: 'Kato (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-2', name: 'Oil Tin', section: 'Roll Section', unit: 'Tin (16 Liter)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-3', name: 'Maayo Bottle', section: 'Roll Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-4', name: 'Cuttar Mirch', section: 'Roll Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-5', name: 'Namak', section: 'Roll Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-6', name: 'Sookhi Toor', section: 'Roll Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-7', name: 'Ghee', section: 'Roll Section', unit: 'Tin (16 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-8', name: 'Jeero', section: 'Roll Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'roll-9', name: 'Chaat Masala', section: 'Roll Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= C. NAAN SECTION =================
  { id: 'naan-1', name: 'Fine Atta', section: 'Naan Section', unit: 'Bori (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-2', name: 'Glucose', section: 'Naan Section', unit: 'Box', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-3', name: 'Every Day', section: 'Naan Section', unit: 'Pouch (1 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-4', name: 'Meedo', section: 'Naan Section', unit: 'Kato (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-5', name: 'Neebo', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-6', name: 'Ajino', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-7', name: 'Jeero', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-8', name: 'Soda', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-9', name: 'Lasan Packet', section: 'Naan Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-10', name: 'Adrak Packet', section: 'Naan Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-11', name: 'Til', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-12', name: 'National Achar Dahi', section: 'Naan Section', unit: 'Jar/Bucket', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-13', name: 'Chilli Sauce', section: 'Naan Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-14', name: 'Sookhi Toor', section: 'Naan Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-15', name: 'Sirko Bottle', section: 'Naan Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'naan-16', name: 'National Karahi Masala', section: 'Naan Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= D. KARAHI SECTION =================
  { id: 'karahi-1', name: 'Meedo Atta', section: 'Karahi Section', unit: 'Kato', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-2', name: 'Daal Moong', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-3', name: 'Zardo Color', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-4', name: 'National Chaat Masala', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-5', name: 'Garam Masala', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-6', name: 'Achar Masala', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-7', name: 'Biryani Masala', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-8', name: 'Chicken Cube', section: 'Karahi Section', unit: 'Box', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-9', name: 'Chicken Powder', section: 'Karahi Section', unit: 'Tin/Pouch', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-10', name: 'Adrak', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-11', name: 'Chola', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-12', name: 'Donghi Kishmish', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-13', name: 'Falsa', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-14', name: 'Rangeen Sewiyan', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-15', name: 'Kand', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-16', name: 'Korma Masala', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-17', name: 'Mix Fruit', section: 'Karahi Section', unit: 'Tin', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-18', name: 'Kalonji', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-19', name: 'Saunf', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-20', name: 'Cuttar Mirch', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-21', name: 'Oil Tin', section: 'Karahi Section', unit: 'Tin (16 Liter)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-22', name: 'Brown Pyaz Cartons', section: 'Karahi Section', unit: 'Carton', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-23', name: 'Kareer Cartons', section: 'Karahi Section', unit: 'Carton', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-24', name: 'Nido Pouch', section: 'Karahi Section', unit: 'Pouch', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-25', name: 'Ajino', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-26', name: 'Anda', section: 'Karahi Section', unit: 'Peti / Dozen', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-27', name: 'Sooka Dhaniya', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-28', name: 'Garha Mirch', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-29', name: 'Kara Mirch', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-30', name: 'Acha Mirch', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-31', name: 'Jeero', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-32', name: 'Haldi', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-33', name: 'Namak', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-34', name: 'Sirko Bottle', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-35', name: 'National Karahi Masala', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-36', name: 'Meethi', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-37', name: 'Langi Mirch', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-38', name: 'Peas Motor', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-39', name: 'Korma Garlic Bottle', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-40', name: 'Spaghetti Packet', section: 'Karahi Section', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-41', name: 'Chilli Sauce', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-42', name: 'Soya Sauce', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-43', name: 'Sookhi Toor', section: 'Karahi Section', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-44', name: 'Cornflour', section: 'Karahi Section', unit: 'Packet (1 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'karahi-45', name: 'Peelo Rang', section: 'Karahi Section', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= E. PIZZA & FAST FOOD SECTION =================
  { id: 'pff-1', name: 'Meedo Atta (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kato', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-2', name: 'Oil Liter', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Liter', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-3', name: 'Chilli Sauce (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-4', name: 'Cuttar Mirch (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-5', name: 'Garha Mirch (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-6', name: 'Sirko Bottle (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-7', name: 'Macaroni', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-8', name: 'Ketchup Bottle (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-9', name: 'Anda (Pizza & Fast Food)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Dozen', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-10', name: 'Namak (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-11', name: 'Nido', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Pouch (1 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-12', name: 'Kheer Packet', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-13', name: 'Tikka Masala', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-14', name: 'Lasagna', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Box', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-15', name: 'Kand (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-16', name: 'Chicken Burger Patty', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Box (24 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-17', name: 'Lasan Packet', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-18', name: 'Adrak Packet (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-19', name: 'Sookhi Toor (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-20', name: 'Ajino (Pizza)', section: 'Pizza & Fast Food', subCategory: 'Pizza', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-21', name: 'Oil Tin (Fast Food)', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Tin', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-22', name: 'Ketchup Bottle (Fast Food)', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-23', name: 'Mustard', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-24', name: 'Kareer (Fast Food)', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'pff-25', name: 'Til (Fast Food Bun)', section: 'Pizza & Fast Food', subCategory: 'Fast Food', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= F. DISPOSAL DEMAND SECTION =================
  { id: 'disp-1', name: 'Tissue', section: 'Disposal Demand', unit: 'Box', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-2', name: 'Printer Roll', section: 'Disposal Demand', unit: 'Roll', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-3', name: 'Foodpanda Roll', section: 'Disposal Demand', unit: 'Roll', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-4', name: 'Shopper', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-5', name: 'Ribbon', section: 'Disposal Demand', unit: 'Roll', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-6', name: 'Ballpen', section: 'Disposal Demand', unit: 'Box (10 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-7', name: 'Pinion', section: 'Disposal Demand', unit: 'Box', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-8', name: 'Matchbox', section: 'Disposal Demand', unit: 'Bundle (10 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-9', name: 'Lifafa', section: 'Disposal Demand', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-10', name: 'Butter Paper', section: 'Disposal Demand', unit: 'Roll/Pkt', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-11', name: 'Deera', section: 'Disposal Demand', unit: 'Pcs', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-12', name: 'Karahi Shopper (6x9)', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-13', name: 'Karahi Shopper (8x10)', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-14', name: 'Gol Dip', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-15', name: 'Bihari Box/Dip', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-16', name: 'Mint Sauce Dip', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-17', name: 'Zardo Dip', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-18', name: 'Phenyl Bottle', section: 'Disposal Demand', unit: 'Bottle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-19', name: '7ml Box', section: 'Disposal Demand', unit: 'Carton (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-20', name: 'Salad Box', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-21', name: 'Nadiyun Bandiyun', section: 'Disposal Demand', unit: 'Bundle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-22', name: 'Aluminium Foil', section: 'Disposal Demand', unit: 'Roll', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-23', name: 'Akhbar', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-24', name: 'Ratto Shopper', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-25', name: 'Shopper (10x13)', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-26', name: 'Shopper (12x15)', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-27', name: 'Shopper (15x18)', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-28', name: 'Cling Film Roll', section: 'Disposal Demand', unit: 'Roll', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-29', name: 'Beaker', section: 'Disposal Demand', unit: 'Pcs', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-30', name: 'Scraper', section: 'Disposal Demand', unit: 'Pcs', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-31', name: 'Aloo Blade', section: 'Disposal Demand', unit: 'Packet', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-32', name: 'Aloo Chalti', section: 'Disposal Demand', unit: 'Pcs', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-33', name: 'Zinger Box', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-34', name: 'Broast Box', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-35', name: 'P2 Box', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-36', name: 'F1 Box', section: 'Disposal Demand', unit: 'Pkt (50 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-37', name: 'Acha Spoon', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-38', name: 'Sada Spoon', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-39', name: 'Kanta', section: 'Disposal Demand', unit: 'Pkt (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-40', name: 'Dustbin Shopper', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-41', name: 'Pizza Shopper', section: 'Disposal Demand', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-42', name: 'Surgical Cap', section: 'Disposal Demand', unit: 'Box (100 Pcs)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-43', name: 'Safiyun', section: 'Disposal Demand', unit: 'Kg / Bundle', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-44', name: 'Mulmul Kapra', section: 'Disposal Demand', unit: 'Mtr', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-45', name: 'Foam Mute', section: 'Disposal Demand', unit: 'Pcs (10 Pack)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-46', name: 'Lohi Mute', section: 'Disposal Demand', unit: 'Pcs (10 Pack)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'disp-47', name: 'Surf', section: 'Disposal Demand', unit: 'Pkt (1 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },

  // ================= G. TOTAL DEMAND & VEGETABLES / MISC =================
  { id: 'veg-1', name: 'Patata (Aloo)', section: 'Vegetables & Misc', unit: 'Bori (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-2', name: 'Shimla Mirch', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-3', name: 'Band Gobi', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-4', name: 'Garhi Gajhar', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-5', name: 'Limo', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-6', name: 'Sooka Pyaz', section: 'Vegetables & Misc', unit: 'Bori (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-7', name: 'Sawa Mirch', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-8', name: 'Sawa Dhaniya', section: 'Vegetables & Misc', unit: 'Gaddi', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-9', name: 'Podina', section: 'Vegetables & Misc', unit: 'Gaddi', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-10', name: 'Keera', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-11', name: 'Chukandar', section: 'Vegetables & Misc', unit: 'Kg', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' },
  { id: 'veg-12', name: 'Pyaz', section: 'Vegetables & Misc', unit: 'Bori (50 Kg)', currentStock: 0, minThreshold: 0, pendingDemand: 0, estimatedPriceRs: 0, lastUpdated: '' }
];

// Department Trackers specified in user prompt (Clean initialization)
export const INITIAL_DEPARTMENT_TRACKERS: DepartmentTracker[] = [
  { id: 'dt-1', name: 'Roll Department', leadPerson: 'Ustad Shafi (Roll Master)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-2', name: 'Naan Department', leadPerson: 'Ustad Jabbar (Tandoor Lead)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-3', name: 'BBQ Department', leadPerson: 'Ustad Fayyaz (BBQ Head)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-4', name: 'Fast Food Department', leadPerson: 'Chef Rizwan', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-5', name: 'Pizza Department', leadPerson: 'Chef Arshad (Pizza Oven)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-6', name: 'Karahi Department', leadPerson: 'Ustad Kareem (Karahi Master)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-7', name: 'Disposal Department', leadPerson: 'Mukhtiar (Storekeeper)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-8', name: 'Vegetable Department', leadPerson: 'Lal Bux (Sabzi Mandi Larkana)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Ready for daily paper slip entries' },
  { id: 'dt-9', name: 'Imran Mamo Special', leadPerson: 'Imran Mamo (Vendor Supply)', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Vendor wholesale demand ledger' },
  { id: 'dt-10', name: 'Kachup Cartoon Batch', leadPerson: 'Direct Warehouse Distribution', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Carton stock demand tracker' },
  { id: 'dt-11', name: 'Medo Kato Batch', leadPerson: 'Atta Flour Mill Larkana', pendingItemsCount: 0, estimatedTotalRs: 0, urgency: 'Low', lastLogDate: '', notes: 'Central 50kg Kato distribution tracker' }
];

// Clean Slips Ledger: starts empty with no fake/mock entries. Real slips are recorded by the user.
export const INITIAL_SLIP_ENTRIES: SlipEntry[] = [];

// Helper to compute monthly trend data dynamically from real slips for any year
export function computeMonthlyDemandTrends(slips: SlipEntry[], selectedYear: string) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((monthName, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const monthPrefix = `${selectedYear}-${monthNum}`;
    const monthSlips = slips.filter((s) => s.date.startsWith(monthPrefix));

    const totalSlips = monthSlips.length;
    const demandExpenseRs = monthSlips.reduce((acc, curr) => acc + curr.priceRs, 0);

    const bbq = monthSlips
      .filter((s) => s.category === 'BBQ Section')
      .reduce((acc, curr) => acc + curr.priceRs, 0);

    const karahi = monthSlips
      .filter((s) => s.category === 'Karahi Section')
      .reduce((acc, curr) => acc + curr.priceRs, 0);

    const naanRoll = monthSlips
      .filter((s) => s.category === 'Naan Section' || s.category === 'Roll Section')
      .reduce((acc, curr) => acc + curr.priceRs, 0);

    const pizzaFastFood = monthSlips
      .filter((s) => s.category === 'Pizza & Fast Food')
      .reduce((acc, curr) => acc + curr.priceRs, 0);

    const disposal = monthSlips
      .filter((s) => s.category === 'Disposal Demand')
      .reduce((acc, curr) => acc + curr.priceRs, 0);

    return {
      month: `${monthName} ${selectedYear.slice(2)}`,
      totalSlips,
      demandExpenseRs,
      bbq,
      karahi,
      naanRoll,
      pizzaFastFood,
      disposal,
    };
  });
}
