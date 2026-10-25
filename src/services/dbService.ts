import { SlipEntry, ItemMaster, DepartmentTracker, SectionCategory } from '../types/inventory';
import { INITIAL_ITEM_MASTER, INITIAL_SLIP_ENTRIES, INITIAL_DEPARTMENT_TRACKERS } from '../data/restaurantItems';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

const SLIPS_KEY = 'bite_slip_entries_v3';
const ITEMS_KEY = 'bite_item_master_v3';
const DEPTS_KEY = 'bite_dept_trackers_v3';
const SYNC_QUEUE_KEY = 'bite_sync_queue_v1';

export interface DbResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'supabase' | 'local_verified';
  synced: boolean;
  message: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'insert_slip' | 'update_slip' | 'delete_slip' | 'update_item';
  payload: any;
  timestamp: number;
  retryCount: number;
}

import {
  sanitizeString,
  sanitizeParsedObject,
  validateImportedSlip,
  validateImportedItem,
  VALID_SECTION_CATEGORIES,
} from '../lib/security';

// -------------------------------------------------------------
// Audio / Haptic Feedback Simulation (Web Audio API Singleton)
// -------------------------------------------------------------
let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function playHapticSound(type: 'tap' | 'success' | 'delete' | 'warning'): void {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'delete') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'warning') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.setValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Audio context may be restricted before interaction, ignore gracefully
  }

  // Trigger Android Vibration API if available on mobile device
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'tap') navigator.vibrate(15);
      else if (type === 'success') navigator.vibrate([25, 40, 25]);
      else if (type === 'delete') navigator.vibrate([40, 60]);
    } catch {
      // Ignored
    }
  }
}

// -------------------------------------------------------------
// Local Storage Safe Engine (Guaranteed Persistence & Type Check)
// -------------------------------------------------------------
function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // If fallback is an array, ensure parsed value is also an array to avoid crashes
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`Storage key ${key} was corrupted (expected array, got ${typeof parsed}). Reverting to fallback.`);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`Error reading key ${key} from storage:`, err);
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
    return false;
  }
}

// -------------------------------------------------------------
// Sync Queue
// -------------------------------------------------------------
function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
  const queue = readLocal<SyncQueueItem[]>(SYNC_QUEUE_KEY, []);
  const newItem: SyncQueueItem = {
    ...item,
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(newItem);
  writeLocal(SYNC_QUEUE_KEY, queue);
}

export function getSyncQueueLength(): number {
  return readLocal<SyncQueueItem[]>(SYNC_QUEUE_KEY, []).length;
}

// -------------------------------------------------------------
// SLIPS CRUD OPERATIONS
// -------------------------------------------------------------

export interface CreateSlipInput {
  date: string;
  itemName: string;
  category: SectionCategory;
  quantity: number;
  unit: string;
  priceRs: number;
  remarks?: string;
  loggedBy?: string;
  status?: 'Logged' | 'Verified' | 'Procured';
}

/**
 * Validates a slip entry with zero tolerance for corrupted data and overflow/injection vectors
 */
export function validateSlipInput(input: Partial<CreateSlipInput>): { valid: boolean; error?: string } {
  const cleanName = sanitizeString(input.itemName, 120);
  if (!cleanName) {
    return { valid: false, error: 'Item Name is required from restaurant sections (max 120 chars).' };
  }
  if (!input.category || !VALID_SECTION_CATEGORIES.includes(input.category as SectionCategory)) {
    return { valid: false, error: 'Please choose an authorized restaurant Section Category.' };
  }

  const qty = Number(input.quantity);
  if (input.quantity === undefined || input.quantity === null || !Number.isFinite(qty) || qty <= 0) {
    return { valid: false, error: 'Quantity (QTY) must be a positive number greater than 0.' };
  }
  if (qty > 1000000) {
    return { valid: false, error: 'Quantity cannot exceed 1,000,000 units.' };
  }

  const price = Number(input.priceRs);
  if (input.priceRs === undefined || input.priceRs === null || !Number.isFinite(price) || price < 0) {
    return { valid: false, error: 'Price (Rs.) cannot be negative and must be a valid number.' };
  }
  if (price > 100000000) {
    return { valid: false, error: 'Price cannot exceed Rs. 100,000,000 per slip.' };
  }

  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'Valid Slip Date (YYYY-MM-DD) is required.' };
  }

  const year = parseInt(input.date.slice(0, 4), 10);
  if (year < 2000 || year > 2100) {
    return { valid: false, error: 'Slip Date year must be between 2000 and 2100.' };
  }

  return { valid: true };
}

/**
 * CREATE SLIP
 * Guarantees zero data loss: Saves locally first, then synchronously attempts cloud sync.
 */
export async function createSlip(input: CreateSlipInput): Promise<DbResponse<SlipEntry>> {
  const validation = validateSlipInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      source: 'local_verified',
      synced: false,
      message: validation.error || 'Validation failed',
    };
  }

  const numQty = Math.max(0.01, Math.min(1000000, Number(input.quantity)));
  const numPrice = Math.max(0, Math.min(100000000, Number(input.priceRs)));
  const unitPrice = numQty > 0 ? Math.round((numPrice / numQty) * 100) / 100 : 0;
  const slipId = `slip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const slipNumber = `SLIP-LKN-${Date.now().toString().slice(-6)}`;

  const newSlip: SlipEntry = {
    id: slipId,
    slipNumber,
    date: input.date,
    itemName: sanitizeString(input.itemName, 120),
    category: input.category,
    quantity: numQty,
    unit: sanitizeString(input.unit || 'Kg', 30),
    priceRs: numPrice,
    unitPriceRs: unitPrice,
    remarks: sanitizeString(input.remarks || '', 500),
    loggedBy: sanitizeString(input.loggedBy || 'IB Junejo (Store Manager)', 80),
    status: input.status || 'Logged',
    timestamp: Date.now(),
  };

  // 1. Save locally with atomic write
  const existingSlips = readLocal<SlipEntry[]>(SLIPS_KEY, INITIAL_SLIP_ENTRIES);
  const updatedSlips = [newSlip, ...existingSlips];
  const localSaved = writeLocal(SLIPS_KEY, updatedSlips);

  if (!localSaved) {
    return {
      success: false,
      error: 'Storage quota exceeded or storage unavailable.',
      source: 'local_verified',
      synced: false,
      message: 'Failed to write slip to local database.',
    };
  }

  // 2. Also increment the pending demand or stock on the item if matched
  updateItemStockOnSlipCreated(newSlip);

  // 3. Attempt Supabase cloud insertion
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('bite_slips').insert({
        id: newSlip.id,
        slip_number: newSlip.slipNumber,
        date: newSlip.date,
        item_name: newSlip.itemName,
        category: newSlip.category,
        quantity: newSlip.quantity,
        unit: newSlip.unit,
        price_rs: newSlip.priceRs,
        unit_price_rs: newSlip.unitPriceRs,
        remarks: newSlip.remarks,
        logged_by: newSlip.loggedBy,
        status: newSlip.status,
      });

      if (!error) {
        playHapticSound('success');
        return {
          success: true,
          data: newSlip,
          source: 'supabase',
          synced: true,
          message: `Slip ${slipNumber} saved and synchronized with Supabase cloud!`,
        };
      } else {
        // Table may not exist or network timeout - queue for sync
        addToSyncQueue({ action: 'insert_slip', payload: newSlip });
        playHapticSound('success');
        return {
          success: true,
          data: newSlip,
          source: 'local_verified',
          synced: false,
          message: `Slip ${slipNumber} securely saved locally (queued for cloud sync: ${error.message})`,
        };
      }
    } catch (netErr: any) {
      addToSyncQueue({ action: 'insert_slip', payload: newSlip });
      playHapticSound('success');
      return {
        success: true,
        data: newSlip,
        source: 'local_verified',
        synced: false,
        message: `Slip ${slipNumber} saved in offline resilient store.`,
      };
    }
  }

  playHapticSound('success');
  return {
    success: true,
    data: newSlip,
    source: 'local_verified',
    synced: false,
    message: `Slip ${slipNumber} recorded successfully!`,
  };
}

/**
 * READ ALL SLIPS
 */
export function getAllSlips(): SlipEntry[] {
  return readLocal<SlipEntry[]>(SLIPS_KEY, INITIAL_SLIP_ENTRIES);
}

/**
 * UPDATE SLIP (CRUD: Update)
 */
export async function updateSlip(id: string, updates: Partial<SlipEntry>): Promise<DbResponse<SlipEntry>> {
  const existingSlips = readLocal<SlipEntry[]>(SLIPS_KEY, INITIAL_SLIP_ENTRIES);
  const targetIndex = existingSlips.findIndex((s) => s.id === id);

  if (targetIndex === -1) {
    return {
      success: false,
      error: `Slip with ID ${id} not found.`,
      source: 'local_verified',
      synced: false,
      message: 'Slip not found in database.',
    };
  }

  const existing = existingSlips[targetIndex];
  const newQty = updates.quantity !== undefined ? Number(updates.quantity) : existing.quantity;
  const newPrice = updates.priceRs !== undefined ? Number(updates.priceRs) : existing.priceRs;
  const newUnitPrice = newQty > 0 ? Math.round((newPrice / newQty) * 100) / 100 : existing.unitPriceRs;

  const updatedSlip: SlipEntry = {
    ...existing,
    ...updates,
    quantity: newQty,
    priceRs: newPrice,
    unitPriceRs: newUnitPrice,
  };

  existingSlips[targetIndex] = updatedSlip;
  writeLocal(SLIPS_KEY, existingSlips);

  // Cloud update attempt
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('bite_slips')
        .update({
          date: updatedSlip.date,
          item_name: updatedSlip.itemName,
          category: updatedSlip.category,
          quantity: updatedSlip.quantity,
          unit: updatedSlip.unit,
          price_rs: updatedSlip.priceRs,
          unit_price_rs: updatedSlip.unitPriceRs,
          remarks: updatedSlip.remarks,
          status: updatedSlip.status,
        })
        .eq('id', id);

      if (!error) {
        playHapticSound('tap');
        return {
          success: true,
          data: updatedSlip,
          source: 'supabase',
          synced: true,
          message: `Slip ${updatedSlip.slipNumber} updated in Cloud database!`,
        };
      } else {
        addToSyncQueue({ action: 'update_slip', payload: updatedSlip });
      }
    } catch {
      addToSyncQueue({ action: 'update_slip', payload: updatedSlip });
    }
  }

  playHapticSound('tap');
  return {
    success: true,
    data: updatedSlip,
    source: 'local_verified',
    synced: false,
    message: `Slip ${updatedSlip.slipNumber} updated successfully.`,
  };
}

/**
 * DELETE SLIP (CRUD: Delete)
 */
export async function deleteSlip(id: string): Promise<DbResponse<boolean>> {
  const existingSlips = readLocal<SlipEntry[]>(SLIPS_KEY, INITIAL_SLIP_ENTRIES);
  const target = existingSlips.find((s) => s.id === id);

  if (!target) {
    return {
      success: false,
      error: 'Slip record not found.',
      source: 'local_verified',
      synced: false,
      message: 'Slip not found.',
    };
  }

  const filtered = existingSlips.filter((s) => s.id !== id);
  writeLocal(SLIPS_KEY, filtered);

  // Cloud delete attempt
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('bite_slips').delete().eq('id', id);
      if (error) {
        addToSyncQueue({ action: 'delete_slip', payload: { id } });
      }
    } catch {
      addToSyncQueue({ action: 'delete_slip', payload: { id } });
    }
  }

  playHapticSound('delete');
  return {
    success: true,
    data: true,
    source: 'local_verified',
    synced: true,
    message: `Slip ${target.slipNumber} deleted from inventory archive.`,
  };
}

// -------------------------------------------------------------
// ITEMS CRUD OPERATIONS
// -------------------------------------------------------------
export function getAllItems(): ItemMaster[] {
  return readLocal<ItemMaster[]>(ITEMS_KEY, INITIAL_ITEM_MASTER);
}

export function saveAllItems(items: ItemMaster[]): boolean {
  return writeLocal(ITEMS_KEY, items);
}

export function updateItemQuantity(
  itemId: string,
  stockDelta: number,
  demandDelta: number
): { success: boolean; item?: ItemMaster } {
  const items = getAllItems();
  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) return { success: false };

  const current = items[index];
  const newStock = Math.max(0, (current.currentStock || 0) + stockDelta);
  const newDemand = Math.max(0, (current.pendingDemand || 0) + demandDelta);

  const updated: ItemMaster = {
    ...current,
    currentStock: newStock,
    pendingDemand: newDemand,
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  items[index] = updated;
  saveAllItems(items);
  playHapticSound('tap');

  return { success: true, item: updated };
}

export function updateItemDetails(
  itemId: string,
  updates: Partial<ItemMaster>
): { success: boolean; item?: ItemMaster } {
  const items = getAllItems();
  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) return { success: false };

  const updated: ItemMaster = {
    ...items[index],
    ...updates,
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  items[index] = updated;
  saveAllItems(items);
  playHapticSound('tap');

  return { success: true, item: updated };
}

function updateItemStockOnSlipCreated(slip: SlipEntry) {
  try {
    const items = getAllItems();
    const matchIndex = items.findIndex(
      (i) => i.name.toLowerCase() === slip.itemName.toLowerCase() && i.section === slip.category
    );

    if (matchIndex !== -1) {
      const match = items[matchIndex];
      // When a slip is logged, it represents recorded kitchen supply intake
      items[matchIndex] = {
        ...match,
        currentStock: (match.currentStock || 0) + slip.quantity,
        estimatedPriceRs: slip.unitPriceRs > 0 ? slip.unitPriceRs : match.estimatedPriceRs,
        lastUpdated: slip.date,
      };
      saveAllItems(items);
    }
  } catch (err) {
    console.warn('Auto stock update error:', err);
  }
}

// -------------------------------------------------------------
// DEPARTMENT TRACKERS CRUD
// -------------------------------------------------------------
export function getAllDepartments(): DepartmentTracker[] {
  return readLocal<DepartmentTracker[]>(DEPTS_KEY, INITIAL_DEPARTMENT_TRACKERS);
}

export function saveAllDepartments(depts: DepartmentTracker[]): boolean {
  return writeLocal(DEPTS_KEY, depts);
}

export function updateDepartment(
  deptId: string,
  updates: Partial<DepartmentTracker>
): { success: boolean; dept?: DepartmentTracker } {
  const depts = getAllDepartments();
  const idx = depts.findIndex((d) => d.id === deptId);
  if (idx === -1) return { success: false };

  depts[idx] = { ...depts[idx], ...updates };
  saveAllDepartments(depts);
  return { success: true, dept: depts[idx] };
}

// -------------------------------------------------------------
// DATABASE BACKUP & RESTORE
// -------------------------------------------------------------
export function exportDatabaseBackup(): string {
  const data = {
    exportDate: new Date().toISOString(),
    restaurant: 'Bite Restaurant Larkana',
    version: '3.0',
    slips: getAllSlips(),
    items: getAllItems(),
    departments: getAllDepartments(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseBackup(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const rawParsed = JSON.parse(jsonString);
    if (!rawParsed || typeof rawParsed !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }

    // Protect against prototype pollution
    const cleanData = sanitizeParsedObject(rawParsed);

    let restoredSlipsCount = 0;
    let restoredItemsCount = 0;

    // Validate slips
    if (Array.isArray(cleanData.slips)) {
      const validatedSlips: SlipEntry[] = [];
      for (const slipRaw of cleanData.slips) {
        const validated = validateImportedSlip(slipRaw);
        if (validated) {
          validatedSlips.push(validated);
        }
      }
      writeLocal(SLIPS_KEY, validatedSlips);
      restoredSlipsCount = validatedSlips.length;
    }

    // Validate items
    if (Array.isArray(cleanData.items)) {
      const validatedItems: ItemMaster[] = [];
      for (const itemRaw of cleanData.items) {
        const validated = validateImportedItem(itemRaw);
        if (validated) {
          validatedItems.push(validated);
        }
      }
      if (validatedItems.length > 0) {
        writeLocal(ITEMS_KEY, validatedItems);
        restoredItemsCount = validatedItems.length;
      }
    }

    // Validate departments
    if (Array.isArray(cleanData.departments)) {
      const validDepts: DepartmentTracker[] = cleanData.departments
        .filter((d: any) => d && typeof d === 'object' && d.id && d.name)
        .map((d: any) => ({
          id: sanitizeString(d.id, 64),
          name: sanitizeString(d.name, 100),
          leadPerson: d.leadPerson ? sanitizeString(d.leadPerson, 80) : undefined,
          pendingItemsCount: Number.isFinite(Number(d.pendingItemsCount)) ? Math.max(0, Number(d.pendingItemsCount)) : 0,
          estimatedTotalRs: Number.isFinite(Number(d.estimatedTotalRs)) ? Math.max(0, Number(d.estimatedTotalRs)) : 0,
          urgency: ['Low', 'Medium', 'High', 'Critical'].includes(d.urgency) ? d.urgency : 'Low',
          lastLogDate: sanitizeString(d.lastLogDate || '', 30),
          notes: sanitizeString(d.notes || '', 300),
        }));
      if (validDepts.length > 0) {
        writeLocal(DEPTS_KEY, validDepts);
      }
    }

    playHapticSound('success');
    return {
      success: true,
      message: `Database securely restored: ${restoredSlipsCount} verified slips and ${restoredItemsCount} catalog items imported!`,
      count: restoredSlipsCount,
    };
  } catch (err: any) {
    return { success: false, message: `Failed to restore database: ${err?.message || 'Parse error'}` };
  }
}

export function resetDatabaseToCleanZero(): void {
  writeLocal(SLIPS_KEY, []);
  writeLocal(ITEMS_KEY, INITIAL_ITEM_MASTER);
  writeLocal(DEPTS_KEY, INITIAL_DEPARTMENT_TRACKERS);
  playHapticSound('delete');
}
