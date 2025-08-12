

import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Extends the Supabase User type to include custom metadata fields.
// This is the single source of truth for the User object shape.
export type User = SupabaseUser & {
  user_metadata: {
    fullName?: string;
    whatsapp?: string;
    plan?: 'free' | 'lifetime';
  };
};

// Uses the official Supabase Session type directly.
export type Session = SupabaseSession;

export interface UserSettings {
  messageTemplate: string;
  kanbanColumnTitles: Record<ProspectStatus, string>;
}

export interface AnalysisDetail {
  finding: string;
  evidence: string;
  source?: {
    title: string;
    uri: string;
  };
}

export type ProspectStatus = 'new' | 'contacted' | 'negotiating' | 'won';

export type SearchSource = 'google' | 'instagram';

export interface Prospect {
  id: string; // New: Unique ID for the prospect
  user_id: string; // New: Foreign key to the user
  name: string;
  description: string;
  website?: string;
  instagramUrl?: string;
  phone?: string;
  address?: string;
  status: ProspectStatus;
  aiScore: number;
  nextRecommendedAction?: string;
  analysis: string;
  analysisBreakdown?: AnalysisDetail[];
  improvementSuggestions?: string;
  foundOn?: SearchSource[];
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}

export interface InteractionAnalysis {
  suggestedResponse: string;
  newNextAction: string;
}