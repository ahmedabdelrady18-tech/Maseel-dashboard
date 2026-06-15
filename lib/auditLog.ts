import { supabase } from './supabase';

export async function saveAuditLog(data: {
  name: string;
  role: string;
  ip?: string;
  country?: string;
  city?: string;
  user_agent?: string;
}) {
  const { error } = await supabase
    .from('access_logs')
    .insert([
      {
        name: data.name,
        role: data.role,
        ip: data.ip || '',
        country: data.country || '',
        city: data.city || '',
        user_agent: data.user_agent || '',
      },
    ]);

  if (error) {
    console.error('Supabase Log Error:', error);
  }
}