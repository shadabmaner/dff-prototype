import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  NotificationListParams,
} from "@/lib/api/notification-client";

const QUERY_KEYS = {
  list: (params: NotificationListParams) => ["notifications", "list", params],
  unreadCount: ["notifications", "unread-count"],
};

export function useNotifications(params: NotificationListParams = {}) {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => getNotifications(params),
    refetchInterval: 60_000, // poll every 60 s
    staleTime: 30_000,
    retry: 1,
  });

  const unreadCountQuery = useQuery({
    queryKey: QUERY_KEYS.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearNotifications(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const refresh = async () => {
    // Invalidate all queries starting with "notifications"
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return {
    notifications: notificationsQuery.data?.data ?? [],
    total: notificationsQuery.data?.total ?? 0,
    unreadCount: unreadCountQuery.data ?? 0,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    error: notificationsQuery.error,
    refetch: refresh,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAll: markAllAsReadMutation.isPending,
    isClearingAll: clearAllMutation.isPending,
  };
}
