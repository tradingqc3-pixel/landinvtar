import { supabase } from '../lib/supabase';
import type { HowItWorksSection } from '../types/how-it-works';

export const howItWorksSectionsService = {
  async getSections(): Promise<HowItWorksSection[]> {
    const { data, error } = await supabase
      .from('how_it_works')
      .select('id, step_number, title, description, image_url, video_url, display_order, created_at, updated_at')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSection(section: Partial<HowItWorksSection>): Promise<HowItWorksSection> {
    const { data: steps } = await supabase.from('how_it_works').select('display_order').order('display_order', { ascending: false }).limit(1);
    const nextOrder = steps && steps.length > 0 ? (steps[0].display_order + 1) : 0;

    const { data, error } = await supabase
      .from('how_it_works')
      .insert([{ ...section, display_order: nextOrder }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSection(id: string, updates: Partial<HowItWorksSection>): Promise<HowItWorksSection> {
    const { data, error } = await supabase
      .from('how_it_works')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSection(id: string): Promise<void> {
    const { error } = await supabase
      .from('how_it_works')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderSections(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await supabase
        .from('how_it_works')
        .update({ display_order: i })
        .eq('id', ids[i]);
    }
  },

  async duplicateSection(id: string): Promise<HowItWorksSection> {
    const sections = await this.getSections();
    const original = sections.find(s => s.id === id);
    if (!original) throw new Error('Step not found');

    const { id: _, created_at, updated_at, display_order: __, ...copyData } = original;

    return await this.createSection(copyData);
  },

  async toggleSection(id: string, isActive: boolean): Promise<void> {
     // Since the new table doesn't have is_active, we could implement it or just ignore if it's not strictly required.
     // For now, let's assume all entries in how_it_works are active.
     console.log('Toggle section not implemented for new how_it_works table');
  }
};
