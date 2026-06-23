export enum NotificationChannel {
  FCM = 'fcm',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app',
}

export enum TemplateVariable {
  // User/Patient Information
  PATIENT_NAME = 'patient_name',
  USER_NAME = 'user_name',
  PATIENT_ID = 'patient_id',
  USER_ID = 'user_id',
  STAFF_NAME='staff_name',
  PARTICIPANT_NAME='participant_name',
  
  // Doctor/Provider Information
  DOCTOR_NAME = 'doctor_name',
  DOCTOR_ID = 'doctor_id',
  PROVIDER_NAME = 'provider_name',
  
  // Appointment Information
  APPOINTMENT_DATE = 'date',
  APPOINTMENT_TIME = 'time',
  APPOINTMENT_RESCHEDULE_TIME = 'reschedule_time',
  APPOINTMENT_ID = 'appointment_id',
  APPOINTMENT_TYPE = 'appointment_type',
  APPOINTMENT_MODE = 'appointment_mode',
  
  // OTP & Authentication
  OTP = 'otp',
  OTP_EXPIRY = 'otp_expiry',
  LOGIN_DATE = 'date',
  LOGIN_TIME = 'time',
  
  // Payment Information
  PAYMENT_AMOUNT = 'amount',
  PAYMENT_ID = 'payment_id',
  PAYMENT_DATE = 'payment_date',
  SUBSCRIPTION_PLAN = 'subscription_plan',
  
  // Collection Information
  COLLECTION_ITEM = 'collection_item',
  COLLECTION_DATE = 'collection_date',
  COLLECTION_ID = 'collection_id',
  
  // Consultation Information
  CONSULTATION_TYPE = 'consultation_type',
  CONSULTATION_DURATION = 'consultation_duration',
  CONSULTATION_LINK = 'consultation_link',
  
  // System Information
  APP_NAME = 'app_name',
  SUPPORT_EMAIL = 'support_email',
  SUPPORT_PHONE = 'support_phone',
  WEBSITE_URL = 'website_url',
  
  // Generic
  TITLE = 'title',
  BODY = 'body',
  MESSAGE = 'message',
  ACTION_URL = 'action_url',
  ACTION_TEXT = 'action_text',

  // Knowledge Base
  COURSE_NAME = 'course_name',
  MODULE_NAME = 'module_name',
  RESOURCE_NAME = 'resource_name',

  // Sales
  LEAD_NAME = 'lead_name',
  LEAD_EMAIL = 'lead_email',
  LEAD_PHONE = 'lead_phone',

  // Webinar
  WEBINAR_NAME = 'webinar_name',
  WEBINAR_DATE = 'webinar_date',
  WEBINAR_TIME = 'webinar_time',
  WEBINAR_LINK = 'webinar_link',
  WEBINAR_RESCHEDULE_TIME = 'webinar_reschedule_time',

  // Dietitian
  DIETITIAN_NAME = 'dietitian_name',

  // Physio
  PHYSIO_NAME = 'physio_name',

  // Telecaller
  TELECALLER_NAME = 'telecaller_name',

  // Chat
  CHAT_PERSON_NAME = 'chat_person_name',
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
  category: string | null;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  code: string;
  name: string;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  category?: string;
}

export interface UpdateTemplateDto {
  name?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  isActive?: boolean;
  category?: string;
}

export interface TemplatePreviewDto {
  code: string;
  channel: NotificationChannel;
  variables: Record<string, string>;
}

export interface TemplatePreviewResponse {
  renderedTitle: string;
  renderedBody: string;
  source: 'database' | 'static' | 'generic';
}

export interface BulkUpdateDto {
  ids: string[];
  update: Partial<UpdateTemplateDto>;
}

export interface CloneTemplateDto {
  newCode: string;
  newChannel: NotificationChannel;
}

export interface NotificationTemplateListParams {
  page?: number;
  limit?: number;
  channel?: NotificationChannel;
  category?: string;
  code?: string;
  isActive?: boolean;
}

export interface NotificationTemplateListResponse {
  data: NotificationTemplate[];
  meta: {
    total: number;
    page: string | number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface NotificationTemplateOption {
  id: string;
  label: string;
  code: string;
  channel: NotificationChannel;
  locale?: string;
}
