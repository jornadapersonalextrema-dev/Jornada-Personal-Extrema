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

export type GeneratedMessage = {
  detectedProfile: string;
  freeOffer: string;
  headline: string;
  whatsappText: string;
  deepDiveSummary: string;
  nextStep: string;
  urgencyScore: number;
  interestLevel: "baixo" | "medio" | "alto";
};
