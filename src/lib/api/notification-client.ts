import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  notificationId: string;
  templateCode: string;
  domainType: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  body: string;
  status: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  channelResults: Record<string, string>;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  domainType?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** GET /notifications/list */
export async function getNotifications(
  params: NotificationListParams = {}
): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<any>(
    "/notifications/list",
    { params }
  );

  // If the API returns the envelope { data: [...], total: ... } (as in docs/snippets)
  if (data && Array.isArray(data.data)) {
    return data;
  }

  // Fallback: If it returned the array directly
  if (Array.isArray(data)) {
    return {
      data,
      total: data.length,
      unreadCount: 0, // Fallback - ideally count should be in envelope or fetched separately
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
  }

  return data;
}

/** GET /notifications/unread-count */
export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<any>(
    "/notifications/unread-count"
  );
  // Handle both { count: 3 } and { data: { count: 3 } }
  if (data && typeof data.count === "number") return data.count;
  if (data?.data && typeof data.data.count === "number") return data.data.count;
  return 0;
}

/** POST /notifications/:id/read */
export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}

/** POST /notifications/read-all */
export async function markAllNotificationsAsRead(): Promise<number> {
  const { data } = await apiClient.post<any>(
    "/notifications/read-all"
  );
  // Handle both { markedAsRead: 3 } and { data: { markedAsRead: 3 } }
  if (data && typeof data.markedAsRead === "number") return data.markedAsRead;
  if (data?.data && typeof data.data.markedAsRead === "number") return data.data.markedAsRead;
  return 0;
}

/** POST /notifications/clear — Clear all notifications for the current user */
export async function clearNotifications(): Promise<void> {
  await apiClient.post("/notifications/clear");
}

/** GET /notifications/recent */
export async function getRecentNotifications(limit = 10): Promise<any[]> {
  const { data } = await apiClient.get<any>(
    "/notifications/recent",
    { params: { limit } }
  );
  // Handle { notifications: [...] }, { data: { notifications: [...] } }, or array directly
  if (data && Array.isArray(data.notifications)) return data.notifications;
  if (data?.data && Array.isArray(data.data.notifications)) return data.data.notifications;
  if (Array.isArray(data)) return data;
  return [];
}

// ─── FCM Token Registration ───────────────────────────────────────────────────

/** PUT /auth/app-info — register FCM token on login */
export async function registerFcmToken(
  fcmToken: string
): Promise<void> {
  console.log("[FCM API] Registering token with server...", { fcm_token: fcmToken, device_type: "web" });
  await apiClient.put("/auth/app-info", {
    fcm_token: fcmToken,
    device_type: "web",
  });
  console.log("[FCM API] Successfully called /auth/app-info for registration.");
}

/** PUT /auth/app-info — clear FCM token on logout */
export async function clearFcmToken(fcmToken?: string | null): Promise<void> {
  console.log("[FCM API] Clearing token from server...", { fcm_token: fcmToken });
  await apiClient.put("/auth/app-info", {
    fcm_token: fcmToken ?? null,
    device_type: "web",
  });
  console.log("[FCM API] Successfully called /auth/app-info for clearing.");
}
