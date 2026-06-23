"use client"

import * as React from "react"
import { X, Bell, CheckCheck, Check, Loader2, BellOff } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Just now"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "Just now"
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "HIGH": return "bg-red-500"
    case "MEDIUM": return "bg-amber-500"
    default: return "bg-blue-500"
  }
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"unread" | "read">("unread")
  const [page, setPage] = React.useState(1)
  const LIMIT = 20

  const {
    notifications,
    total,
    unreadCount,
    isLoading,
    isFetching,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
    clearAll,
    isClearingAll,
    refetch,
  } = useNotifications({ 
    page, 
    limit: activeTab === "read" ? 50 : LIMIT, 
  })

  // Listen for foreground FCM messages and refetch the list
  React.useEffect(() => {
    // Dynamically import to avoid SSR issues
    let cleanup: (() => void) | undefined
    import("firebase/messaging").then(({ onMessage }) => {
      import("@/lib/firebase").then(({ messaging }) => {
        if (!messaging) {
          console.warn("[FCM UI] Firebase messaging not initialized, cannot listen for messages.");
          return;
        }
        console.log("[FCM UI] Setting up foreground message listener...");
        cleanup = onMessage(messaging, (payload) => {
          console.log("[FCM UI] Foreground message received:", payload);
          
          // Show a toast if it's a foreground message
          if (payload.notification) {
            toast.info(payload.notification.title || "New Notification", {
              description: payload.notification.body,
              action: {
                label: "View",
                onClick: () => {
                   // Refresh and the user can see it in the already open panel or badge
                   void refetch();
                }
              }
            });
          }

          void refetch();
          console.log("[FCM UI] Triggered list and unread count refetch due to new message.");
        });
      })
    }).catch((err) => {
      console.error("[FCM UI] Error setting up FCM listener:", err);
    });
    return () => { cleanup?.() }
  }, [refetch])

  // Reset page when panel opens or tab changes
  React.useEffect(() => {
    if (open) {
      setPage(1)
      void refetch()
    }
  }, [open, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasMore = notifications.length < total
  
  // For the "Read" tab, we might need to filter if the API returns all
  // But if unreadOnly is false, it returns both. 
  // Ideally backend should support readOnly, but for now we filter.
  const displayNotifications = activeTab === "read" 
    ? notifications.filter(n => n.isRead)
    : notifications.filter(n => !n.isRead);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col bg-background shadow-2xl border-l border-border/50",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-[15px] font-bold text-foreground">Notifications</span>
          </div>
          <div className="flex items-center gap-1">
            {activeTab === "unread" && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </Button>
            )}
            {activeTab === "read" && displayNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                onClick={() => clearAll()}
                disabled={isClearingAll}
              >
                {isClearingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <BellOff className="h-3 w-3" />
                )}
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-muted/60"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50 bg-muted/20 p-1">
          <button
            onClick={() => setActiveTab("unread")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-[12px] font-semibold transition-all",
              activeTab === "unread" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className={cn(
                "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold",
                activeTab === "unread" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("read")}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md py-1.5 text-[12px] font-semibold transition-all",
              activeTab === "read" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Read
          </button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="px-6 py-4 space-y-4">
              {/* Skeleton notification items */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex gap-4 py-4 animate-pulse">
                  {/* Priority indicator skeleton */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted/40" />
                  </div>
                  
                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title skeleton */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-4 bg-muted/30 rounded w-3/4" />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted/20" />
                        <div className="h-3 bg-muted/20 rounded w-12" />
                      </div>
                    </div>
                    
                    {/* Body skeleton */}
                    <div className="space-y-1">
                      <div className="h-3 bg-muted/20 rounded w-full" />
                      <div className="h-3 bg-muted/20 rounded w-5/6" />
                    </div>
                    
                    {/* Action skeleton */}
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-muted/20 rounded-full w-16" />
                      <div className="ml-auto h-6 bg-muted/20 rounded-full w-20" />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading text at bottom */}
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 bg-muted/20 rounded-full animate-spin" />
                  <span className="text-[11px]">Loading notifications...</span>
                </div>
              </div>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 px-12 text-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 border border-border/20">
                  <BellOff className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/30" />
              </div>
              <div className="space-y-2">
                <p className="text-[14px] font-semibold text-foreground">
                  {activeTab === "unread" ? "You're all caught up!" : "No old notifications"}
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {activeTab === "unread" 
                    ? "Check the 'Read' tab for your notification history." 
                    : "Notifications you've already seen will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {displayNotifications.map((n, index) => (
                <div
                  key={n.id}
                  className={cn(
                    "group relative flex gap-4 px-6 py-4 transition-all duration-200 cursor-pointer",
                    "hover:bg-muted/20 hover:translate-x-1",
                    !n.isRead && "bg-primary/[0.03] border-l-2 border-primary/30",
                    index === 0 && "border-t border-border/20"
                  )}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n.id)
                  }}
                >
                  {/* Priority indicator */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110",
                      priorityColor(n.priority)
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn(
                        "text-[14px] leading-snug line-clamp-1 transition-colors duration-200",
                        n.isRead 
                          ? "font-medium text-foreground/80" 
                          : "font-semibold text-foreground group-hover:text-primary"
                      )}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                      {n.body}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {n.domainType && (
                        <span className="rounded-full bg-gradient-to-r from-muted/60 to-muted/40 border border-border/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {n.domainType}
                        </span>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(n.id)
                          }}
                          className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-2.5 py-1 text-[10px] font-medium text-primary hover:from-primary/20 hover:to-primary/10 transition-all duration-200 hover:scale-105"
                        >
                          <Check className="h-3 w-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : null}
                    Load more notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/50 px-5 py-3">
          <p className="text-[11px] text-muted-foreground/60 text-center">
            {total > 0 ? `${total} total notification${total !== 1 ? "s" : ""}` : "No notifications"}
          </p>
        </div>
      </div>
    </>
  )
}
