import { useEffect, useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { registerFcmToken, clearFcmToken } from "@/lib/api/notification-client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

let fcmToken: string | null = null;

/** Just get the FCM token from Firebase */
export async function getFCMToken(): Promise<string | null> {
  if (!messaging || typeof window === "undefined") return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission not granted:", permission);
      return null;
    }

    // Explicitly register the service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("[FCM] Service worker registered/found:", registration.scope);

    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (!token) {
      console.warn("[FCM] No token received from Firebase.");
      return null;
    }

    fcmToken = token;
    console.log("[FCM] Successfully obtained token:", token);
    if (typeof window !== "undefined") {
      localStorage.setItem("fcm_token", token);
    }
    return token;
  } catch (err) {
    console.error("[FCM] Error getting token from Firebase:", err);
    return null;
  }
}

/** Request permission, get token, and send to server */
export async function initFCM(): Promise<string | null> {
  console.log("[FCM] Initializing FCM...");
  const token = await getFCMToken();
  if (token) {
    console.log("[FCM] Token obtained during initialization, registering with server...");
    await registerFcmToken(token);
    console.log("[FCM] Server registration call completed.");
  } else {
    console.warn("[FCM] Could not obtain token during initialization.");
  }
  return token;
}

/** Clear the FCM token from the server on logout */
export async function deinitFCM(): Promise<void> {
  console.log("[FCM] De-initializing FCM (clearing from server)...");
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("fcm_token") : null
  const tokenToClear = fcmToken ?? storedToken

  if (!tokenToClear) {
    console.log("[FCM] No cached token available to clear from server. Skipping API call.")
    if (typeof window !== "undefined") {
      localStorage.removeItem("fcm_token")
    }
    return
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("fcm_token");
  }
  try {
    await clearFcmToken(tokenToClear);
    fcmToken = null;
    console.log("[FCM] Token successfully cleared from server.");
  } catch (err) {
    console.error("[FCM] Error clearing token from server during logout:", err);
  }
}

/** Hook: provides foreground message listener + exposes token state */
export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    const t = await initFCM();
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!messaging) return;
    const unsub = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message:", payload);
      // Foreground notifications are handled by the NotificationPanel component
    });
    return unsub;
  }, []);

  return { token, requestPermission };
};
