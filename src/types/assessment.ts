export interface AssessmentQuestion {
  id: string;
  speciality_id: string;
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'radio' | 'checkbox' | 'dropdown';
  required: boolean;
  voice_prompt?: string;
  validation_json?: Record<string, any>;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  option_value: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSection {
  id: string;
  form_id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  questions?: FormQuestion[];
}

export interface AssessmentForm {
  id: string;
  speciality_id: string;
  name: string;
  version: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  questions?: FormQuestion[];
  sections?: AssessmentSection[];
}

export interface FormQuestion extends AssessmentQuestion {
  display_order: number;
  config_override?: Record<string, any>;
}

export interface AssessmentSubmission {
  id: string;
  user_id: string;
  patient_id: string;
  speciality_id: string;
  form_id: string;
  responses_json: string;
  created_at: string;
  updated_at: string;
  responses?: Record<string, any>;
}

export interface CreateQuestionRequest {
  speciality_id: string;
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'radio' | 'checkbox' | 'dropdown';
  required?: boolean;
  voice_prompt?: string;
  validation_json?: Record<string, any>;
}

export interface CreateOptionRequest {
  option_text: string;
  option_value: string;
  display_order?: number;
}

export interface CreateFormRequest {
  speciality_id: string;
  name: string;
  version?: number;
  metadata?: Record<string, any>;
}

export interface CreateSectionRequest {
  form_id: string;
  name: string;
  display_order: number;
}

export interface FormQuestionLink {
  question_id: string;
  section_id?: string;
  display_order?: number;
}

export interface LinkQuestionsRequest {
  questions: FormQuestionLink[];
}

export interface UpdateFormQuestionRequest {
  config_override?: Record<string, any>;
  display_order?: number;
  section_id?: string;
}

export interface SubmitAssessmentRequest {
  speciality_id: string;
  form_id?: string;
  responses: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface Speciality {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}
