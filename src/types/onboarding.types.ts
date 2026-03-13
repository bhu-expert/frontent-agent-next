export interface BrandContext {
  id: number;
  title: string;
  body: string;
}

export interface TemplateOption {
  id: string;
  lbl: string;
  ph: string;
  type?: string;
}

export interface Template {
  id: string;
  name: string;
  desc: string;
  cls: string;
  dynOpts: TemplateOption[];
  prev: string;
}

export interface IGTemplateField {
  id: string;
  lbl: string;
  ph: string;
}

export interface IGTemplate {
  id: string;
  name: string;
  kpi: string;
  purpose: string;
  fields: IGTemplateField[];
  example: string;
  tags: string[];
  cls: string;
  prev: string;
}

export interface ContextMeta {
  funnel: string;
  angle: string;
  color: string;
}

export interface GeneratedSlide {
  h: string;
  b: string;
  num: number;
  cov: boolean;
}

export interface GeneratedPrompt {
  lbl: string;
  txt: string;
}

export interface GeneratedContent {
  slides: GeneratedSlide[];
  caption: string;
  hashtags: string[];
  prompts: GeneratedPrompt[];
}

export interface ToolState {
  url: string;
  ctx: BrandContext[];
  ratings: Record<number, number>;
  bm: Set<number>;
  likes: Set<number>;
  selCtx: number | null;
  selTpl: string | null;
  selIgTpl: string | null;
  tone: string | null;
  emoji: string;
  platform: string;
  cta: string;
  offer: string;
  slideN: number;
  curStep: number;
  gen: GeneratedContent | null;
  // Template dynamic fields
  hookQuestion: string;
  mythStatement: string;
  realityStatement: string;
  problemStatement: string;
  solutionStatement: string;
  stepCount: string;
  frameworkName: string;
  clientName: string;
  resultBefore: string;
  resultAfter: string;
  statFact: string;
  visionOutcome: string;
  processStep: string;
  ownBrand: string;
  rivalBrand: string;
  communityTag: string;
  // IG fields
  igStoryAngle: string;
  igHeroMoment: string;
  igCoreFact: string;
  igBrandSolution: string;
  igProof: string;
  igOfferDetails: string;
  igDeadline: string;
  igPrice: string;
  igKeyBenefits: string;
  igCustomerName: string;
  igQuote: string;
  igVariety: string;
  igResult: string;
  igMission: string;
  igImpactStat: string;
  igCampaign: string;
  igCTA: string;
  // Modal
  modalOpen: boolean;
  modalMode: "login" | "signup";
  // Toast
  toastMsg: string;
  toastVisible: boolean;
  toastColor: string;
  // View mode
  p3View: "list" | "grid";
}

// --- API Types ---

export interface ApiError {
  message: string;
  status: number;
}

export interface ContextBlock {
  context_index: 1 | 2 | 3 | 4 | 5;
  content: string;
  title: string;
}

export interface AdVariation {
  headline: string;
  subheadline: string;
  body_text: string;
  cta_text: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  image_prompt: string;
  image_url?: string | null;
  offer_text?: string;
  quote_author?: string;
  tagline?: string;
  launch_label?: string;
}

export interface AdTypeVariations {
  ad_type: string;
  variations: AdVariation[];
}

export interface AdVariationsResponse {
  ad_types: AdTypeVariations[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface BrandEvent {
  step: string;
  message: string;
  brand_id?: string;
  progress?: number;
  data?: Record<string, unknown>;
}

export interface AdVariationsPayload {
  context_index: 1 | 2 | 3 | 4 | 5;
  user_brief: string;
  ad_type: string | null;
}

export interface ContextFeedbackPayload {
  context_index: 1 | 2 | 3 | 4 | 5;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

export interface ContextFeedbackResponse {
  status: string;
  message: string;
  data: {
    brand_id: string;
    context_index: 1 | 2 | 3 | 4 | 5;
    rating: 1 | 2 | 3 | 4 | 5;
    regenerated: boolean;
    context_md: string;
    output_path?: string;
    updated_section: ContextBlock;
  };
}

export interface ContextFeedbackStreamEvent {
  event: "progress" | "context_chunk" | "complete" | "error";
  data: {
    chunk?: string;
    context_index?: 1 | 2 | 3 | 4 | 5;
    message?: string;
    step?: string;
    status?: string;
    data?: ContextFeedbackResponse["data"];
  };
}

export interface PendingAction {
  type: "GENERATE_VARIATIONS";
  params: {
    context_index: 1 | 2 | 3 | 4 | 5;
    user_brief: string;
    ad_type: string | null;
  };
}
