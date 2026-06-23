"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Eye, CheckCircle2, XCircle, AlertTriangle, Flag, ArrowLeft, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import type { PendingModerationPost } from "@/types/community"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface PendingPostsResponse {
  success: boolean
  statusCode: number
  data: PendingModerationPost[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages?: number
    approved?: number
    rejected?: number
    aiFlags?: number
  }
  message?: string
}

interface PendingPostActionResponse {
  success: boolean
  statusCode: number
  data: PendingModerationPost
  message?: string
}

type ModerationAction = "approve" | "reject"

interface ModerationDialogAction {
  type: ModerationAction
  pendingId: string
}

export default function ModerationRequestsPage() {
  const limit = 10
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<ModerationDialogAction | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [focusedPost, setFocusedPost] = useState<PendingModerationPost | null>(null)
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<PendingPostsResponse, Error, PendingPostsResponse>({
    queryKey: ["pending-community-posts", page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PendingPostsResponse>(
        `/community/admin/pending-posts?page=${page}&limit=${limit}`
      )
      const payload = response.data

      if (!payload?.success || !payload?.data) {
        throw new Error(payload?.message || "Unable to load moderation queue")
      }

      return payload
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })

  const pendingPosts = data?.data ?? []
  const totalItems = data?.meta?.total ?? pendingPosts.length
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit))
  const stats = useMemo(() => {
    const approved = data?.meta?.approved ?? 0
    const rejected = data?.meta?.rejected ?? 0
    const aiFlags =
      data?.meta?.aiFlags ?? pendingPosts.filter((post) => post.flag_sources?.includes("AI")).length

    return {
      total: totalItems,
      pending: pendingPosts.length,
      approved,
      rejected,
      aiFlags,
    }
  }, [data, pendingPosts, totalItems])

  const openDialog = (type: ModerationAction, pendingId: string) => {
    setDialogAction({ type, pendingId })
    setDialogOpen(true)
  }

  const { mutateAsync: moderatePost, isPending: isModerating } = useMutation({
    mutationFn: async ({ pendingId, type }: ModerationDialogAction) => {
      const endpoint = type === "approve" ? "approve" : "reject"
      const { data } = await apiClient.post<PendingPostActionResponse>(
        `/community/admin/pending-posts/${pendingId}/${endpoint}`
      )

      if (!data?.success) {
        throw new Error(data?.message || "Unable to update post status")
      }

      return data.data
    },
    onSuccess: (_result, variables) => {
      toast(
        variables.type === "approve" ? "Post approved" : "Post rejected",
        {
          description:
            variables.type === "approve"
              ? "The post is now visible to the community."
              : "The post has been rejected and will remain hidden.",
        }
      )

      queryClient.invalidateQueries({ queryKey: ["pending-community-posts"] })
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : "Please try again"
      toast.error("Unable to complete action", {
        description: message,
      })
    },
  })

  const handleConfirmAction = async () => {
    if (!dialogAction) return

    try {
      await moderatePost(dialogAction)
      setDialogOpen(false)
      setDialogAction(null)
    } catch {
      // Toast already handled in onError
    }
  }

  const getDialogContent = () => {
    if (!dialogAction) return { title: "", description: "" }

    switch (dialogAction.type) {
      case "approve":
        return {
          title: "Approve post",
          description: "Are you sure you want to approve this post and publish it to the community?",
        }
      case "reject":
        return {
          title: "Reject post",
          description: "Are you sure you want to reject this post? It will remain hidden from members.",
        }
    }
  }

  const getReasonBadge = (reason?: string | null) => {
    switch (reason?.toLowerCase()) {
      case "abuse":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Abuse</Badge>
      case "spam":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Spam</Badge>
      case "sensitive":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Sensitive</Badge>
      default:
        return <Badge className="bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]">Other</Badge>
    }
  }

  const getTypeBadge = (type?: string | null) => {
    return type === "AI" ? (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
        <AlertTriangle className="h-3 w-3" />
        AI Flag
      </Badge>
    ) : (
      <Badge className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
        <Flag className="h-3 w-3" />
        User Report
      </Badge>
    )
  }

  const handlePageChange = (direction: "next" | "prev") => {
    setPage((prev) => {
      if (direction === "next") {
        return Math.min(totalPages, prev + 1)
      }

      return Math.max(1, prev - 1)
    })
  }

  const openDrawer = (post: PendingModerationPost) => {
    setFocusedPost(post)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setFocusedPost(null)
  }

  const paginationStart = pendingPosts.length ? (page - 1) * limit + 1 : 0
  const paginationEnd = pendingPosts.length ? Math.min(page * limit, totalItems) : 0

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/community">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
            Admin Portal / Community Management / Moderation
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">Moderation Requests</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">Review AI flagged posts and user reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh queue"}
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between gap-3">
          <p>{error?.message || "Something went wrong while loading moderation data."}</p>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Total Requests</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Flag className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Pending Review</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Approved</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">Rejected</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Auto Hidden by AI</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.aiFlags}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-[var(--foreground)]">
              Pending Reports ({stats.pending})
            </CardTitle>
            {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]">
                  <TableHead className="font-semibold">Preview</TableHead>
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Report Type</TableHead>
                  <TableHead className="font-semibold">Reason</TableHead>
                  <TableHead className="font-semibold">Reporter</TableHead>
                  <TableHead className="font-semibold">Reported At</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p className="text-sm">Loading moderation queue…</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && pendingPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="text-center text-sm text-[var(--muted-foreground)]">
                        You're all caught up — no pending posts right now.
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {pendingPosts.map((report) => {
                  const mediaUrl = report.media_payload?.[0]?.url
                  const mediaType = report.media_payload?.[0]?.media_type
                  const authorName = report.author_name || "Unknown author"
                  const authorId = report.author_user_id || "—"
                  const primaryReason = report.flag_reasons?.[0]
                    ?.replace("_", " ")
                    ?.replace(/-/g, " ")
                    ?.toLowerCase()
                  const reporterName = report.reporter_name ||
                    (report.flag_sources?.includes("AI") ? "AI System" : "+91•••••••••")
                  const reportedAt = report.created_at
                  const postId = report.post_id || report.id
                  const caption = report.content_payload?.caption || report.content_payload?.content
                  const reasonDescriptions = report.flag_reasons || []
                  const flagSource = report.flag_sources?.[0]

                  return (
                    <TableRow key={report.id} className="hover:bg-[var(--muted)]/50">
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center">
                          {mediaUrl ? (
                            mediaType === "VIDEO" ? (
                              <video className="w-full h-full object-cover" src={mediaUrl} muted />
                            ) : (
                              <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">No media</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{authorName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{authorId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(flagSource)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getReasonBadge(primaryReason)}
                          {reasonDescriptions.length > 0 && (
                            <ul className="text-xs text-[var(--muted-foreground)] space-y-0.5 max-w-xs">
                              {reasonDescriptions.map((reason: string) => (
                                <li key={reason} className="line-clamp-2">{reason}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-[var(--foreground)]">{reporterName}</p>
                          {caption && (
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 max-w-xs">“{caption}”</p>
                          )}
                          {report.reporter_note && (
                            <p className="text-xs text-[var(--muted-foreground)] max-w-xs">{report.reporter_note}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reportedAt ? (
                          <>
                            <p className="text-sm text-[var(--foreground)]">{new Date(reportedAt).toLocaleDateString()}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{new Date(reportedAt).toLocaleTimeString()}</p>
                          </>
                        ) : (
                          <p className="text-xs text-[var(--muted-foreground)]">—</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openDrawer(report)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog("approve", report.id)}
                            className="text-emerald-600 hover:text-emerald-700"
                            disabled={isModerating}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog("reject", report.id)}
                            className="text-rose-600 hover:text-rose-700"
                            disabled={isModerating}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {paginationStart === 0
                ? "No items to display"
                : `Showing ${paginationStart} – ${paginationEnd} of ${totalItems} requests`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("prev")}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>{getDialogContent().description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isModerating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isModerating}>
              {isModerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={drawerOpen} onOpenChange={(open) => (open ? setDrawerOpen(true) : closeDrawer())}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {focusedPost ? (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="text-left">
                  {focusedPost.content_payload?.caption || "Flagged Post"}
                </SheetTitle>
                <p className="text-sm text-[var(--muted-foreground)] text-left">
                  Posted {new Date(focusedPost.created_at).toLocaleString()}
                </p>
              </SheetHeader>

              <div className="flex items-center justify-between rounded-md border bg-[var(--muted)] px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{focusedPost.author_name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{focusedPost.author_user_id}</p>
                </div>
                <Badge variant="secondary">{focusedPost.status}</Badge>
              </div>

              {focusedPost.media_payload?.length ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Media</p>
                  <div className="grid grid-cols-2 gap-3">
                    {focusedPost.media_payload.map((media) => (
                      <div key={media.storage_key || media.url} className="rounded-lg border overflow-hidden">
                        {media.media_type === "VIDEO" ? (
                          <video src={media.url} controls className="w-full h-32 object-cover" />
                        ) : (
                          <img src={media.url} alt={media.storage_key || "Post media"} className="w-full h-32 object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {focusedPost.flag_reasons?.length ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Flag Reasons</p>
                  <div className="space-y-2 rounded-md border bg-[var(--card)] p-3">
                    {focusedPost.flag_reasons.map((reason, idx) => (
                      <div key={`${reason}-${idx}`} className="text-sm text-[var(--foreground)]">
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {focusedPost.content_payload?.content && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Content</p>
                  <div className="rounded-md border bg-[var(--card)] p-3 text-sm text-[var(--foreground)]">
                    {focusedPost.content_payload.content}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => openDialog("approve", focusedPost.id)} disabled={isModerating}>
                  Approve Post
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => openDialog("reject", focusedPost.id)}
                  disabled={isModerating}
                >
                  Reject Post
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--muted-foreground)]">Select a post to view its details.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
