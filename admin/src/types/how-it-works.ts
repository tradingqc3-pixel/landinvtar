export interface HowItWorksSection {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Legacy fields (optional for backward compatibility if needed, but not used in new table)
  section_name?: string;
  subtitle?: string;
  layout?: string;
  is_active?: boolean;
}
