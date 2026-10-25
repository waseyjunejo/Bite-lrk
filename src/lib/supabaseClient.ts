import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage key for user-configured Supabase credentials
const CONFIG_KEY = 'bite_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading Supabase config from localStorage:', e);
  }

  // Fallback to environment variables if provided
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    // Reset client cache
    cachedClient = null;
  } catch (e) {
    console.error('Failed to save Supabase config to localStorage:', e);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
    cachedClient = null;
  } catch (e) {
    console.error('Failed to clear Supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSavedSupabaseConfig();
  const cleanUrl = config.url ? config.url.trim() : '';
  const cleanKey = config.anonKey ? config.anonKey.trim() : '';

  if (cleanUrl && cleanKey && /^https?:\/\/[a-zA-Z0-9.-]+/i.test(cleanUrl)) {
    try {
      cachedClient = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
        },
      });
      return cachedClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const config = getSavedSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured. Running in high-reliability Local Storage Mode.',
    };
  }

  const startTime = performance.now();
  try {
    // Attempt lightweight ping by checking auth session or querying slips table
    const { error } = await client.from('bite_slips').select('id').limit(1);
    const latency = Math.round(performance.now() - startTime);

    if (error) {
      // If table does not exist, credentials are still valid, but table is missing
      if (error.code === '42P01' || error.message?.includes('relation "bite_slips" does not exist')) {
        return {
          connected: true,
          message: `Connected to Supabase (${latency}ms)! Table 'bite_slips' pending creation (SQL script provided).`,
          latencyMs: latency,
        };
      }
      return {
        connected: false,
        message: `Supabase responded with code ${error.code}: ${error.message}`,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Supabase Cloud PostgreSQL connected successfully (${latency}ms)!`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Network error connecting to Supabase cloud.',
    };
  }
}

// SQL Schema for one-click setup in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- Bite Restaurant Larkana - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.bite_slips (
    id TEXT PRIMARY KEY,
    slip_number TEXT NOT NULL,
    date DATE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    price_rs NUMERIC NOT NULL,
    unit_price_rs NUMERIC NOT NULL,
    remarks TEXT,
    logged_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Logged',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bite_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    sub_category TEXT,
    unit TEXT NOT NULL,
    current_stock NUMERIC DEFAULT 0,
    min_threshold NUMERIC DEFAULT 0,
    pending_demand NUMERIC DEFAULT 0,
    estimated_price_rs NUMERIC DEFAULT 0,
    last_updated TEXT,
    remarks TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bite_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bite_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read/write with app token
CREATE POLICY "Public full access to slips" ON public.bite_slips FOR ALL USING (true);
CREATE POLICY "Public full access to items" ON public.bite_items FOR ALL USING (true);
`;
