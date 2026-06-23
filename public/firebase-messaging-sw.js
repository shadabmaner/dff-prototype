importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkKofqnquHWTFwG0ebjvd0Q9eTguohBzU",
  authDomain: "dr-app-d37b2.firebaseapp.com",
  projectId: "dr-app-d37b2",
  storageBucket: "dr-app-d37b2.firebasestorage.app",
  messagingSenderId: "635176273058",
  appId: "1:635176273058:web:f32137013c9ed01a71c3fb",
  measurementId: "G-836SCSD4RL"
});

const messaging = firebase.messaging();

console.log("[FCM SW] Service Worker script loaded.");

messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Received background message:", payload);

  const title = payload.notification?.title || payload.data?.title || "New Notification";
  const body = payload.notification?.body || payload.data?.body || "You have a new message from Dr. App.";

  const options = {
    body: body,
    icon: "/next.svg",
    tag: payload.data?.notificationId || "general",
    data: {
      url: "/dashboard",
    },
    badge: "/next.svg",
  };

  console.log("[FCM SW] Displaying notification:", title, options);
  self.registration.showNotification(title, options)
    .then(() => console.log("[FCM SW] Notification displayed successfully."))
    .catch((err) => console.error("[FCM SW] Error displaying notification:", err));
});

self.onnotificationclick = (event) => {
  console.log("[FCM SW] Notification clicked:", event.notification.tag);
  event.notification.close();
  // ... rest of the click logic

  // Try to open the URL provided in the payload data, or default to dashboard
  const urlToOpen = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If we already have a window open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If no windows are open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
};
