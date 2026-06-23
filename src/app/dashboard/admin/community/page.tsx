"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  FileText,
  AlertTriangle,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  ShieldAlert,
  TrendingUp,
  MessageSquare,
  Image,
  Video,
  Search,
  RotateCcw,
  X,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { CommunityStats, CommunityPost, PostComment, MediaType } from "@/types/community"
import {
  useCommunityPosts, 
  usePostComments, 
  useHidePost, 
  useRestorePost, 
  useDeletePost,
  useHideComment,
  useRestoreComment
} from "@/hooks/use-community-posts"
import { useCommunityStats } from "@/hooks/use-community-stats"
import { Skeleton } from "@/components/ui/skeleton"

// Fallback stats
const fallbackStats: CommunityStats = {
  totalPosts: 1248,
  activePosts: 1156,
  hiddenPosts: 67,
  deletedPosts: 25,
  pendingReports: 23,
  totalReports: 145,
  autoHiddenByAI: 18,
  approvedReports: 89,
  rejectedReports: 33,
  activeAuthors: 456,
  restrictedAuthors: 8,
  bannedAuthors: 3,
}

// Mock posts data
const mockPosts: CommunityPost[] = Array.from({ length: 25 }, (_, i) => {
  const postId = `post-${i + 1}`
  const mediaCount = i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0
  const mediaType: MediaType = i % 3 === 0 ? "IMAGE" : i % 3 === 1 ? "VIDEO" : "TEXT"
  
  return {
    post_id: postId,
    author_user_id: `user-${Math.floor(Math.random() * 10) + 1}`,
    author_name: ["Rahul Kumar", "Priya Sharma", "Amit Verma", "Sneha Patel", "Rohan Singh"][Math.floor(Math.random() * 5)],
    author_avatar: null,
    caption: `This is a sample community post content about health and fitness. It contains valuable information for our community members. Post number ${i + 1}.`,
    status: i % 10 === 0 ? "HIDDEN" : i % 15 === 0 ? "DELETED" : "ACTIVE",
    like_count: Math.floor(Math.random() * 500) + 10,
    comment_count: Math.floor(Math.random() * 100),
    share_count: Math.floor(Math.random() * 50),
    category_id: null,
    category_name: null,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    id: postId,
    media: Array.from({ length: mediaCount }, (_, j) => ({
      id: `media-${postId}-${j + 1}`,
      post_id: postId,
      media_type: mediaType,
      url: mediaType === "IMAGE" ? `https://picsum.photos/seed/${i}-${j}/400/300` : `https://picsum.photos/seed/video${i}-${j}/400/300`,
      thumbnail_url: mediaType === "VIDEO" ? `https://picsum.photos/seed/video${i}-${j}/400/300` : null,
      storage_key: `community/posts/${postId}-${j}.${mediaType === "IMAGE" ? "jpg" : "mp4"}`,
      duration_seconds: mediaType === "VIDEO" ? Math.floor(Math.random() * 120) + 30 : null,
      display_order: j,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }
})

// Generate mock comments for each post
const generateMockComments = (postId: string): PostComment[] => {
  const commentCount = Math.floor(Math.random() * 5) + 3
  return Array.from({ length: commentCount }, (_, i) => ({
    id: `${postId}-comment-${i + 1}`,
    postId,
    authorId: `user-${Math.floor(Math.random() * 20) + 1}`,
    authorName: ["Priya Sharma", "Amit Verma", "Sneha Patel", "Rohan Singh", "Arjun Mehta", "Kavya Reddy"][Math.floor(Math.random() * 6)],
    authorAvatar: undefined,
    content: [
      "Great post! Very motivating 💯",
      "Thanks for sharing! What's your workout routine?",
      "This is so inspiring! Keep it up! 🔥",
      "Love this content! Very helpful.",
      "Amazing! Can you share more details?",
      "This really helped me today. Thank you!"
    ][Math.floor(Math.random() * 6)],
    likesCount: Math.floor(Math.random() * 50),
    status: i % 8 === 0 ? "hidden" : "visible",
    createdAt: new Date(Date.now() - Math.random() * 10 * 60 * 60 * 1000).toISOString(),
  }))
}

export default function CommunityDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sharedFilter, setSharedFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<{ type: 'hide' | 'restore' | 'delete', postId: string, commentId?: string } | null>(null)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)

  const handleResetFilters = () => {
    setSearchQuery("")
    setMediaTypeFilter("all")
    setStatusFilter("all")
    setSharedFilter("all")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  // API Integration with TanStack Query
  const { data: postsData, isLoading, error } = useCommunityPosts({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    mediaType: mediaTypeFilter,
    status: statusFilter,
    shared: sharedFilter,
    startDate,
    endDate,
  })

  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
    error: statsError,
  } = useCommunityStats()

  const { data: comments = [], refetch: refetchComments } = usePostComments(
    selectedPost?.id || "",
    { enabled: !!selectedPost?.id }
  )

  const hidePostMutation = useHidePost()
  const restorePostMutation = useRestorePost()
  const deletePostMutation = useDeletePost()
  const hideCommentMutation = useHideComment()
  const restoreCommentMutation = useRestoreComment()

  // Fallback to mock data if API fails
  const posts = postsData?.data || []
  const totalPages = postsData?.meta?.totalPages || Math.ceil(mockPosts.length / itemsPerPage)

  // When using API, posts are already filtered and paginated
  const paginatedPosts = posts

  const openDialog = (type: 'hide' | 'restore' | 'delete', postId: string, commentId?: string) => {
    setDialogAction({ type, postId, commentId })
    setDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!dialogAction) return

    const { type, postId, commentId } = dialogAction
    
    try {
      // Handle comment actions
      if (commentId) {
        if (type === 'hide') {
          await hideCommentMutation.mutateAsync({ postId, commentId })
        } else if (type === 'restore') {
          await restoreCommentMutation.mutateAsync({ postId, commentId })
        }
        refetchComments()
      } else {
        // Handle post actions
        if (type === 'hide') {
          await hidePostMutation.mutateAsync(postId)
        } else if (type === 'restore') {
          await restorePostMutation.mutateAsync(postId)
        } else if (type === 'delete') {
          await deletePostMutation.mutateAsync(postId)
        }
      }
    } catch (error) {
      console.error('Action failed:', error)
    }
    
    setDialogOpen(false)
    setDialogAction(null)
  }

  const getDialogContent = () => {
    if (!dialogAction) return { title: '', description: '' }
    
    const isComment = !!dialogAction.commentId
    const itemType = isComment ? 'comment' : 'post'
    
    switch (dialogAction.type) {
      case 'hide':
        return {
          title: `Hide ${isComment ? 'Comment' : 'Post'}`,
          description: `Are you sure you want to hide this ${itemType} from the community? It will no longer be visible to users.`
        }
      case 'restore':
        return {
          title: `Restore ${isComment ? 'Comment' : 'Post'}`,
          description: `Are you sure you want to restore this ${itemType} and make it visible to the community?`
        }
      case 'delete':
        return {
          title: 'Delete Post',
          description: 'Are you sure you want to soft delete this post? This will remove it from public view permanently.'
        }
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <Image className="h-4 w-4 text-blue-600" />
      case "VIDEO":
        return <Video className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
      case "HIDDEN":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Hidden</Badge>
      case "DELETED":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Deleted</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post)
    setSidebarOpen(true)
    setLiked(false)
    setMediaIndex(0)
  }

  const handleLike = () => {
    if (!selectedPost) return
    setLiked(!liked)
    setSelectedPost((prev) => prev ? ({
      ...prev,
      like_count: liked ? prev.like_count - 1 : prev.like_count + 1,
    }) : null)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const stats = statsData ?? fallbackStats

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`stat-skel-${idx}`} className="border-0 bg-[var(--card)]/70 shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-11 w-full md:flex-1" />
              <Skeleton className="h-11 w-full md:w-40" />
              <Skeleton className="h-11 w-full md:w-40" />
              <Skeleton className="h-11 w-full md:w-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`post-skeleton-${idx}`} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
            Admin Portal / Community Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Community Dashboard
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Overview of community activity, moderation, and user engagement
            </p>
          </div>
          <Link href="/dashboard/admin/community/moderation">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Manage Community Moderation
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/admin/community/posts">
          <Card className="border border-[var(--border)]/80 bg-[var(--card)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Posts Management</p>
                <p className="text-sm text-[var(--muted-foreground)]">Manage all community posts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/community/moderation">
          <Card className="border border-[var(--border)]/80 bg-[var(--card)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Moderation Requests</p>
                <p className="text-sm text-[var(--muted-foreground)]">Review flagged content</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/community/user-activity">
          <Card className="border border-[var(--border)]/80 bg-[var(--card)] hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">User Activity</p>
                <p className="text-sm text-[var(--muted-foreground)]">Monitor user violations</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div> */}

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                  Total Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalPosts}</p>
                <p className="text-xs text-blue-700 mt-2">All community posts</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  Active Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.activePosts}</p>
                <p className="text-xs text-emerald-700 mt-2">Currently visible</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center shadow-lg">
                <Eye className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                  Hidden Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.hiddenPosts}</p>
                <p className="text-xs text-amber-700 mt-2">Temporarily hidden</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-lg">
                <EyeOff className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                  Deleted Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.deletedPosts}</p>
                <p className="text-xs text-rose-700 mt-2">Soft deleted</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center shadow-lg">
                <Trash2 className="h-6 w-6 text-rose-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Stats */}
      {/* <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                  Reports Pending
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.pendingReports}</p>
                <p className="text-xs text-purple-700 mt-2">Need review</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Flag className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                  Auto Hidden by AI
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.autoHiddenByAI}</p>
                <p className="text-xs text-indigo-700 mt-2">AI flagged posts</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                  Active Authors
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.activeAuthors}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">Content creators</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      <Card className="border-0 bg-[var(--card)] shadow-sm">
        <CardContent className="p-4">
            <div className="flex flex-col gap-4 w-full md:flex-row md:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-[var(--muted)] border-[var(--border)] min-w-max"
                />
              </div>
              
              {/* Media Type */}
              <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
                <SelectTrigger className="h-14 w-full bg-[var(--muted)] border-[var(--border)]">
                  <SelectValue placeholder="Media Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Media</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full bg-[var(--muted)] border-[var(--border)]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 w-full h-10 bg-[var(--muted)] border-[var(--border)]"
                />
              </div>
              
              {/* End Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 w-full h-10 bg-[var(--muted)] border-[var(--border)]"
                />
              </div>
              
              {/* Shared */}
              <Select value={sharedFilter} onValueChange={setSharedFilter}>
                <SelectTrigger className="h-10 w-full bg-[var(--muted)] border-[var(--border)]">
                  <SelectValue placeholder="Shared Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="yes">Shared</SelectItem>
                  <SelectItem value="no">Not Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)]" onClick={handleResetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
              </Button>
            </div>
            
            
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card className="border border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <CardTitle className="text-lg font-bold text-[var(--foreground)]">
            Community Posts ({postsData?.meta?.total || posts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]">
                  <TableHead className="font-semibold">Preview</TableHead>
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Content</TableHead>
                  <TableHead className="font-semibold">Media</TableHead>
                  <TableHead className="font-semibold">Stats</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-[var(--muted)]/50">
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center">
                        {post.media && post.media.length > 0 ? (
                          post.media[0].media_type === "IMAGE" ? (
                            <img src={post.media[0].url} alt="Post" className="w-full h-full object-cover" />
                          ) : (
                            <Video className="h-6 w-6 text-purple-500" />
                          )
                        ) : (
                          <FileText className="h-6 w-6 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[100px]">
                        <p className="font-semibold text-[var(--foreground)] truncate">{post.author_name}</p>
                        {/* <p className="text-xs text-[var(--muted-foreground)]">{post.author_user_id}</p> */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p
                        className="text-sm text-[var(--muted-foreground)] truncate max-w-[120px]"
                        title={post.caption ?? ""}
                      >
                        {post.caption || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.media && post.media.length > 0 ? (
                          <>
                            {getMediaIcon(post.media[0].media_type)}
                            <span className="text-sm capitalize">{post.media[0].media_type.toLowerCase()}</span>
                            {post.media.length > 1 && (
                              <Badge variant="outline" className="text-xs">+{post.media.length - 1}</Badge>
                            )}
                          </>
                        ) : (
                          <>
                            {getMediaIcon("TEXT")}
                            <span className="text-sm capitalize">text</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--muted-foreground)]">❤️</span>
                          <span className="font-medium">{post.like_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--muted-foreground)]">💬</span>
                          <span className="font-medium">{post.comment_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--muted-foreground)]">🔗</span>
                          <span className="font-medium">{post.share_count}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(post.created_at).toLocaleTimeString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewPost(post)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {post.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog('hide', post.post_id)}
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {post.status === "HIDDEN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog('restore', post.post_id)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {post.status === "DELETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog('restore', post.post_id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {post.status !== "DELETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog('delete', post.post_id)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, postsData?.meta?.total || posts.length)} of{" "}
                {postsData?.meta?.total || posts.length} posts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[var(--muted-foreground)]">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Sidebar - Mobile-Style Post Viewer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {selectedPost && (
            <div className="h-full">
              {/* Header */}
              <div className="p-4 border-b bg-[var(--card)] sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle>Post Preview</SheetTitle>
                  {getStatusBadge(selectedPost.status)}
                </div>
              </div>

              {/* Mobile-Style Post Card */}
              <div className="bg-[var(--card)]">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {selectedPost.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{selectedPost.author_name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{getTimeAgo(selectedPost.created_at)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)]">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Post Media */}
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="relative w-full bg-[var(--muted)]">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--muted)]">
                      {selectedPost.media[mediaIndex].media_type === "IMAGE" ? (
                        <img
                          src={selectedPost.media[mediaIndex].url}
                          alt={`Post media ${mediaIndex + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : selectedPost.media[mediaIndex].media_type === "VIDEO" ? (
                        <video
                          src={selectedPost.media[mediaIndex].url}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    {selectedPost.media.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--card)]/80 p-2 shadow-md hover:bg-[var(--card)]"
                          onClick={() =>
                            setMediaIndex((prev) =>
                              prev === 0 ? selectedPost.media!.length - 1 : prev - 1
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </button>
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--card)]/80 p-2 shadow-md hover:bg-[var(--card)]"
                          onClick={() =>
                            setMediaIndex((prev) =>
                              prev === selectedPost.media!.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                          {selectedPost.media.map((item, idx) => (
                            <button
                              key={item.id}
                              className={`h-2.5 w-2.5 rounded-full border border-white transition ${
                                idx === mediaIndex ? "bg-[var(--card)]" : "bg-[var(--card)]/40"
                              }`}
                              onClick={() => setMediaIndex(idx)}
                              aria-label={`Go to media ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <div className="flex gap-2 overflow-x-auto border-t border-[var(--border)] bg-[var(--card)]/80 p-3">
                          {selectedPost.media.map((mediaItem, idx) => (
                            <button
                              key={`thumb-${mediaItem.id}`}
                              onClick={() => setMediaIndex(idx)}
                              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border ${
                                idx === mediaIndex ? "border-[var(--foreground)]" : "border-[var(--border)]"
                              }`}
                            >
                              {mediaItem.media_type === "IMAGE" ? (
                                <img src={mediaItem.url} alt="Thumb" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--foreground)]/80 text-white">
                                  <Video className="h-4 w-4" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4 space-y-4">
                  {/* Interaction Stats */}
                  <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                        {selectedPost.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {selectedPost.comment_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {selectedPost.share_count}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 py-2 border-y border-[var(--border)]">
                    <Button
                      variant="ghost"
                      className={`flex-1 gap-2 ${liked ? "text-rose-600" : "text-[var(--muted-foreground)]"}`}
                      onClick={handleLike}
                    >
                      <Heart className={`h-5 w-5 ${liked ? "fill-rose-600" : ""}`} />
                      Like
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-[var(--muted-foreground)]">
                      <MessageCircle className="h-5 w-5" />
                      Comment
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-[var(--muted-foreground)]">
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>

                  {/* Post Description */}
                  <div>
                    <p className="text-[var(--foreground)]">
                      <span className="font-semibold">{selectedPost.author_name}</span>{" "}
                      {selectedPost.caption}
                    </p>
                  </div>

                  {/* Post Metadata */}
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    {selectedPost.media && selectedPost.media.length > 0 && (
                      <Badge variant="outline" className="capitalize">{selectedPost.media[0].media_type.toLowerCase()}</Badge>
                    )}
                    {selectedPost.media && selectedPost.media.length > 1 && (
                      <Badge variant="outline">+{selectedPost.media.length - 1} more</Badge>
                    )}
                    {selectedPost.category_name && (
                      <Badge variant="outline">{selectedPost.category_name}</Badge>
                    )}
                    <span>•</span>
                    <span>ID: {selectedPost.post_id}</span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-[var(--border)] bg-[var(--muted)]/50">
                <div className="p-4">
                  <p className="font-semibold text-[var(--foreground)] mb-3">
                    Comments ({comments.length})
                  </p>
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className="flex-1 bg-[var(--card)] rounded-lg p-3 border border-[var(--border)]">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm text-[var(--foreground)]">
                                  {comment.authorName}
                                </p>
                                {comment.status === "hidden" && (
                                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">Hidden</Badge>
                                )}
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] mb-2">
                                {getTimeAgo(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)]">{comment.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-[var(--muted-foreground)]">{comment.likesCount} likes</span>
                            <span className="text-[var(--muted-foreground)]">•</span>
                            {comment.status === "visible" ? (
                              <button
                                onClick={() => openDialog('hide', selectedPost.post_id, comment.id)}
                                className="text-amber-600 hover:text-amber-700 font-medium"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => openDialog('restore', selectedPost.post_id, comment.id)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Unhide
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="p-4 bg-[var(--muted)] border-t">
                <h3 className="font-semibold text-[var(--foreground)] mb-3 text-sm">Post Admin Actions</h3>
                <div className="flex gap-2">
                  {selectedPost.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openDialog('hide', selectedPost.post_id)
                        setSidebarOpen(false)
                      }}
                      className="text-amber-600 hover:text-amber-700 flex-1"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Post
                    </Button>
                  )}
                  {selectedPost.status === "HIDDEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openDialog('restore', selectedPost.post_id)
                        setSidebarOpen(false)
                      }}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  )}
                  {selectedPost.status === "DELETED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openDialog('restore', selectedPost.post_id)
                        setSidebarOpen(false)
                      }}
                      className="text-blue-600 hover:text-blue-700 flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore Post
                    </Button>
                  )}
                  {selectedPost.status !== "DELETED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openDialog('delete', selectedPost.post_id)
                        setSidebarOpen(false)
                      }}
                      className="text-rose-600 hover:text-rose-700 flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
