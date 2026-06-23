export enum AnnouncementStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementChannel {
  FCM = 'FCM',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_APP = 'IN_APP',
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  created_by: string;
  target_audience: string | null;
  target_program_id: string | null;
  speciality_id: string;
  priority: AnnouncementPriority;
  is_active: boolean;
  scheduled_at: string;
  expires_at: string | null;
  status: AnnouncementStatus;
  channel: AnnouncementChannel | null;
  sent_at: string | null;
  sent_count: number;
  read_count: number;
  metadata: Record<string, any> | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  location_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementDto {
  title: string;
  description: string;
  scheduled_at: string;
  speciality_id: string;
  thumbnail_url?: string;
  target_audience?: string;
  channels: AnnouncementChannel[];
  priority?: AnnouncementPriority;
  expires_at?: string;
  metadata?: Record<string, any>;
  state?: string;
  city?: string;
  pincode?: string;
  address?: string;
  location_url?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  description?: string;
  scheduled_at?: string;
  speciality_id?: string;
  thumbnail_url?: string;
  target_audience?: string;
  priority?: AnnouncementPriority;
  expires_at?: string;
  metadata?: Record<string, any>;
  state?: string;
  city?: string;
  pincode?: string;
  address?: string;
  location_url?: string;
}

export interface AnnouncementListParams {
  page?: number;
  limit?: number;
  status?: AnnouncementStatus;
  target_audience?: string;
  speciality_id?: string;
  scheduled_from?: string;
  scheduled_to?: string;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
}
