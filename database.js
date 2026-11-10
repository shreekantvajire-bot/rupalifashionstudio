/* database.js – Supabase connection (online shared database, login and photo storage) */
'use strict';
const CONFIGURED = typeof SUPABASE_URL !== 'undefined' && !/YOUR_/.test(SUPABASE_URL) && typeof supabase !== 'undefined';
const sb  = CONFIGURED ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
// Second client used only by the admin to create employee logins without being logged out
const sb2 = CONFIGURED ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'rfs-create' } }) : null;
const mail = id => id.trim().toLowerCase() + '@rupalistudio.com';   // Login ID -> internal email
const ok = async p => { const { data, error } = await p; if (error) throw error; return data; };
const PH = {                                                         // photo storage helpers
  up: (path, blob) => ok(sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })),
  url: async p => { const { data, error } = await sb.storage.from('photos').createSignedUrl(p, 86400); if (error) throw error; return data.signedUrl; },
  rm: async ps => { for (let i = 0; i < ps.length; i += 100) await ok(sb.storage.from('photos').remove(ps.slice(i, i + 100))); }
};
