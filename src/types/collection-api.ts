export type CollectionUnlockStrategy = 
  | "immediate" 
  | "after_previous_complete" 
  | "on_journey_day" 
  | "manual"

export type ItemUnlockStrategy = 
  | "sequential" 
  | "all_open" 
  | "day_based" 
  | "manual"

export type MediaType = "video" | "pdf" | "image" | "audio" | "link"

export type MediaSource = "external" | "s3"

export type NotificationChannel = "push" | "email" | "sms"

export interface Collection {
  id: string
  speciality_id: string
  program_id: string | null
  name: string
  description: string | null
  sort_order: number
  collection_unlock_strategy: CollectionUnlockStrategy
  collection_unlock_day: number | null
  unlock_after_collection_id: string | null
  item_unlock_strategy: ItemUnlockStrategy
  notification_channels: NotificationChannel[]
  is_active: boolean
  skip_weekends?: boolean
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  deleted_by: string | null
  item_count?: number
}

export interface CollectionItem {
  id: string
  collection_id: string
  title: string
  description: string | null
  media_type: MediaType
  media_url: string
  media_source: MediaSource
  thumbnail_url: string | null
  duration_seconds: number | null
  file_size_bytes: number | null
  display_order: number
  unlock_day: number | null
  step_label: string | null
  tags: string[] | null
  notification_time: string
  auto_complete_after_seconds: number | null
  is_active: boolean
  uploaded_by_role: string | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  deleted_by: string | null
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[]
}

export interface PatientCollectionJourney {
  id: string
  patient_id: string
  collection_id: string
  enrollment_id: string
  journey_started_at: string
  is_collection_unlocked: boolean
  collection_unlocked_at: string | null
  total_items_count: number
  completed_count: number
}

export interface CollectionItemProgress {
  id: string
  collection_item_id: string
  title: string
  media_type: MediaType
  display_order: number
  step_label: string | null
  is_unlocked: boolean
  unlocked_at: string | null
  is_completed: boolean
  completed_at: string | null
  progress_percent: number
}

export interface PatientCollectionProgress extends PatientCollectionJourney {
  collection_name: string
  sort_order: number
  collection_unlock_strategy: CollectionUnlockStrategy
  item_unlock_strategy: ItemUnlockStrategy
  items: CollectionItemProgress[]
}

export interface CollectionPatientProgress {
  patient_id: string
  patient_name: string
  journey_day: number
  completed_count: number
  total_items: number
  progress_percent: number
  last_activity_at: string | null
}

export interface CreateCollectionRequest {
  speciality_id: string
  program_id?: string | null
  name: string
  description?: string | null
  sort_order?: number
  collection_unlock_strategy?: CollectionUnlockStrategy
  collection_unlock_day?: number | null
  unlock_after_collection_id?: string | null
  item_unlock_strategy?: ItemUnlockStrategy
  notification_channels?: NotificationChannel[]
  is_active?: boolean
  skip_weekends?: boolean
}

export interface UpdateCollectionRequest {
  name?: string
  description?: string | null
  sort_order?: number
  collection_unlock_strategy?: CollectionUnlockStrategy
  collection_unlock_day?: number | null
  unlock_after_collection_id?: string | null
  item_unlock_strategy?: ItemUnlockStrategy
  notification_channels?: NotificationChannel[]
  is_active?: boolean
  skip_weekends?: boolean
}

export interface CreateCollectionItemRequest {
  title: string
  description?: string | null
  media_type?: MediaType
  media_url: string
  media_source?: MediaSource
  thumbnail_url?: string | null
  duration_seconds?: number | null
  file_size_bytes?: number | null
  display_order?: number
  unlock_day?: number | null
  step_label?: string | null
  tags?: string[]
  notification_time?: string
  auto_complete_after_seconds?: number | null
  uploaded_by_role?: string | null
}

export interface UpdateCollectionItemRequest {
  title?: string
  description?: string | null
  media_type?: MediaType
  media_url?: string
  media_source?: MediaSource
  thumbnail_url?: string | null
  duration_seconds?: number | null
  file_size_bytes?: number | null
  display_order?: number
  unlock_day?: number | null
  step_label?: string | null
  tags?: string[]
  notification_time?: string
  auto_complete_after_seconds?: number | null
  uploaded_by_role?: string | null
  is_active?: boolean
}

export interface BulkCreateItemsRequest {
  items: CreateCollectionItemRequest[]
}

export interface ReorderItem {
  id: string
  sort_order?: number
  display_order?: number
}

export interface ReorderRequest {
  order: ReorderItem[]
}

export interface CollectionListParams {
  speciality_id?: string
  program_id?: string
  is_active?: boolean
  include_deleted?: boolean
}

export interface CollectionItemListParams {
  media_type?: MediaType
  step_label?: string
}

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  message: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
