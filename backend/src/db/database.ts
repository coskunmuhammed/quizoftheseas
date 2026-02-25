import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// For backward compatibility during transition
export async function openDb() {
  return null as any;
}
