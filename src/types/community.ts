export type PostStatus = "ACTIVE" | "HIDDEN" | "DELETED" | "PENDING"
export type MediaType = "IMAGE" | "VIDEO" | "TEXT"
export type ReportType = "AI" | "USER"
export type ReportReason = "abuse" | "spam" | "sensitive" | "other"
export type ReportStatus = "pending" | "approved" | "rejected"
export type UserModerationStatus = "active" | "restricted" | "banned"

export interface PostMedia {
  id: string
  post_id: string
  media_type: MediaType
  url: string
  thumbnail_url: string | null
  storage_key: string
  duration_seconds: number | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  post_id: string
  author_user_id: string
  author_name: string
  author_avatar: string | null
  caption: string | null
  status: PostStatus
  like_count: number
  comment_count: number
  share_count: number
  category_id: string | null
  category_name: string | null
  created_at: string
  updated_at: string
  id: string
  media: PostMedia[]
}

export interface PendingModerationPost {
  id: string
  post_id?: string
  author_user_id: string
  author_name: string
  author_avatar: string | null
  status: PostStatus
  created_at: string
  updated_at?: string
  content_payload?: {
    caption?: string | null
    content?: string | null
    categoryId?: string | null
  }
  media_payload?: Array<{
    url: string
    media_type: MediaType
    storage_key?: string
    display_order?: number
    thumbnail_url?: string | null
    duration_seconds?: number | null
  }>
  flag_reasons?: string[]
  flag_sources?: ("AI" | "USER")[]
  reporter_name?: string
  reporter_note?: string
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  likesCount: number
  status: "visible" | "hidden"
  createdAt: string
}

export interface ModerationReport {
  id: string
  postId: string
  post?: CommunityPost
  reportedBy?: string
  reporterName?: string
  type: ReportType
  reason: ReportReason
  reasonText?: string
  status: ReportStatus
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface UserModeration {
  userId: string
  userName: string
  userAvatar?: string
  totalPosts: number
  hiddenPosts: number
  deletedPosts: number
  reportsCount: number
  status: UserModerationStatus
  restrictedUntil?: string
  lastViolation?: string
}

export interface CommunityStats {
  totalPosts: number
  activePosts: number
  hiddenPosts: number
  deletedPosts: number
  pendingReports: number
  totalReports: number
  autoHiddenByAI: number
  approvedReports: number
  rejectedReports: number
  activeAuthors: number
  restrictedAuthors: number
  bannedAuthors: number
}
