export type QuestionType = "single_choice" | "multiple_choice" | "free_text";

export type Audience = {
  slug: string;
  name: string;
  description: string;
  freeOffer: string;
};

export type QuestionOption = {
  value: string;
  label: string;
  tags?: string[];
};

export type Question = {
  key: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  allowComment?: boolean;
  category: "perfil" | "dor" | "desejo" | "rotina" | "deep_dive" | "oferta";
  audiences?: string[];
  options?: QuestionOption[];
};

export type SurveyPayload = {
  audienceSlug: string;
  name: string;
  whatsapp: string;
  email?: string;
  ageRange?: string;
  city?: string;
  source?: string;
  answers: Record<string, string | string[]>;
  comments: Record<string, string>;
};

export type InterestLevel = "baixo" | "medio" | "alto";

export type LeadPriority = "alta" | "media" | "baixa";

export type LeadCrmFields = {
  priority?: LeadPriority | string | null;
  next_contact_at?: string | null;
  internal_notes?: string | null;
  delivered_offer?: string | null;
  last_message_at?: string | null;
};

export type LeadSummary = LeadCrmFields & {
  id: string;
  name: string;
  whatsapp: string;
  audience_slug: string;
  detected_profile: string;
  interest_level: string;
  urgency_score?: number | null;
  lead_status: string;
  created_at: string;
};

export type GeneratedMessage = {
  detectedProfile: string;
  freeOffer: string;
  headline: string;
  whatsappText: string;
  deepDiveSummary: string;
  nextStep: string;
  urgencyScore: number;
  interestLevel: InterestLevel;
};
