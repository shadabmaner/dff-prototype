import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { apiClient } from "@/lib/api-client"
import type { CommunityPost, PostComment } from "@/types/community"

// API response types
interface PostsResponse {
  success: boolean
  statusCode: number
  data: CommunityPost[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

interface CommentsResponse {
  success: boolean
  statusCode: number
  data: PostComment[]
  message?: string
}

interface PostActionResponse {
  success: boolean
  statusCode: number
  data: CommunityPost
  message?: string
}

interface CommentActionResponse {
  success: boolean
  statusCode: number
  data: PostComment
  message?: string
}

// Fetch posts with pagination and filters
export function useCommunityPosts(options?: {
  page?: number
  limit?: number
  search?: string
  mediaType?: string
  status?: string
  shared?: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}) {
  const {
    page = 1,
    limit = 10,
    search,
    mediaType,
    status,
    shared,
    startDate,
    endDate,
    enabled = true,
  } = options || {}

  return useQuery<PostsResponse, Error>({
    queryKey: ["community-posts", page, limit, search, mediaType, status, shared, startDate, endDate],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      if (search) params.append("search", search)
      if (mediaType && mediaType !== "all") params.append("mediaType", mediaType)
      if (status && status !== "all") params.append("status", status)
      if (shared && shared !== "all") params.append("shared", shared)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const { data } = await apiClient.get<PostsResponse>(`/community/admin/posts?${params.toString()}`)

      if (!data?.success || !data?.data) {
        throw new Error(data?.message || "Unable to load posts")
      }

      return data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Fetch comments for a specific post
export function usePostComments(postId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true

  return useQuery<PostComment[], Error>({
    queryKey: ["post-comments", postId],
    enabled: Boolean(postId) && enabled,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<CommentsResponse>(`/community/admin/posts/${postId}/comments`)

        if (!data?.success || !data?.data) {
          throw new Error(data?.message || "Unable to load comments")
        }

        return data.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return []
        }
        throw (error instanceof Error ? error : new Error("Unable to load comments"))
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

// Hide post (soft delete)
export function useHidePost() {
  const queryClient = useQueryClient()

  return useMutation<PostActionResponse, Error, string>({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.delete<PostActionResponse>(`/community/posts/${postId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })
}

// Restore post
export function useRestorePost() {
  const queryClient = useQueryClient()

  return useMutation<PostActionResponse, Error, string>({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.patch<PostActionResponse>(`/community/admin/posts/${postId}/restore`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })
}

// Permanent delete post
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation<PostActionResponse, Error, string>({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.delete<PostActionResponse>(`/community/admin/posts/${postId}/permanent`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })
}

// Hide comment
export function useHideComment() {
  const queryClient = useQueryClient()

  return useMutation<CommentActionResponse, Error, { postId: string; commentId: string }>({
    mutationFn: async ({ postId, commentId }) => {
      const { data } = await apiClient.patch<CommentActionResponse>(
        `/community/admin/posts/${postId}/comments/${commentId}/hide`
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] })
    },
  })
}

// Restore comment
export function useRestoreComment() {
  const queryClient = useQueryClient()

  return useMutation<CommentActionResponse, Error, { postId: string; commentId: string }>({
    mutationFn: async ({ postId, commentId }) => {
      const { data } = await apiClient.patch<CommentActionResponse>(
        `/community/admin/posts/${postId}/comments/${commentId}/restore`
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] })
    },
  })
}
