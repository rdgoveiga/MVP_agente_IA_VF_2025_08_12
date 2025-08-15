import { supabase } from '../lib/supabaseClient';
import { UserSettings } from '../types';

export const toDb = (s: UserSettings) => ({
  user_id: s.userId,
  message_template: s.messageTemplate,
  search_sources: s.searchSources,
  include_whatsapp: s.includeWhatsApp,
});

export const fromDb = (r: any) => ({
  userId: r.user_id,
  messageTemplate: r.message_template,
  searchSources: r.search_sources,
  includeWhatsApp: r.include_whatsapp,
});

export const saveUserSettings = async (s: UserSettings) => {
  return supabase.from('user_settings')
    .upsert(toDb(s), { onConflict: 'user_id' })
    .select()
    .single();
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select()
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    const defaultSettings: UserSettings = {
      userId,
      messageTemplate: '',
      searchSources: [],
      includeWhatsApp: false,
    };
    await saveUserSettings(defaultSettings);
    return defaultSettings;
  }
  return fromDb(data);
};