# SaaS Chat Frontend Architecture & Logic Flow

This document serves as a blueprint for building a high-performance, real-time SaaS chat interface. It focuses on the architectural organization, state management, and data flow between the UI and the backend.

---

## 1. High-Level Component Structure

A standard SaaS chat interface should be split into three primary structural zones:

### A. The Sidebar (Navigation & Discovery)
*   **Search/Start New Chat**: Search users by name/username.
*   **Rooms/DM List**: Displays a list of recent conversations.
    *   Shows: Avatar, Name, Last Message Snippet, Timestamp, and Unread Badge.
    *   Logic: Listen for `message_new` events globally to update "Last Message" and "Unread" counts in real-time.

### B. The Main Chat Area (Active Conversation)
*   **Header**: Name of room/contact, member list, and presence status (Online/Offline).
*   **Message List**: Scrollable area showing history. 
    *   Features: Date separators, own vs. other message styling, read receipts, and attachments.
*   **Composer Area**: Multi-line input, emoji picker, and file attachment buttons.
    *   Logic: Handle "Typing..." indicators while user is focused and typing.

### C. The Detail/Profile Pane (Optional)
*   Info about the room members, shared files, and settings.

---

## 2. Core State Management

To keep the UI fast and consistent, manage your state using a global store (Redux, Zustand, or React Context):

| State Key | Purpose |
| :--- | :--- |
| [user](file:///c:/workspace/projects/CHAT_BACKEND/backend/src/routes/users.ts#22-391) | Stores the currently logged-in user's profile and JWT. |
| `rooms` | An array of room objects. Store here to drive the Sidebar list. |
| `activeRoomId` | The ID of the room currently being viewed. |
| `messages` | A Map/Object where keys are `roomId` and values are arrays of messages. This prevents re-fetching when switching back and forth. |
| `presence` | A Map of user IDs to status (online/offline). |

---

## 3. The Real-Time Process Flow

### Step 1: App Boot (The Handshake)
1.  **Login**: User authenticates $\rightarrow$ Store JWT.
2.  **Fetch Profile & Rooms**: Call `GET /users/me` and `GET /rooms`. 
3.  **Establish WebSocket**: 
    *   Call `GET /centrifugo/token`.
    *   Connect to Centrifugo using the token.
    *   Subscribe to a global "Presence" channel or individual user channel for general notifications.

### Step 2: Selecting a Chat
1.  User clicks a room in the Sidebar $\rightarrow$ Set `activeRoomId`.
2.  **Load History**: If messages are not in local state, call `GET /rooms/:id/messages`.
3.  **Active Subscription**: Call `POST /centrifugo/subscription-token` for this specific room and subscribe via WebSocket.
4.  **Mark Read**: Call `POST /rooms/:id/read` to clear unread counts.

### Step 3: Handling Incoming Events (The "Push" Layer)
Listen to the WebSocket `onMessage` globally:
*   **New Message**: 
    *   If `msg.roomId === activeRoomId`: Append to current view.
    *   If `msg.roomId !== activeRoomId`: Increment unread count in Sidebar.
*   **Presence Change**: Update user's status icon globally.
*   **Typing**: Show "User is typing..." indicator if for the `activeRoomId`.

### Step 4: Sending Data (The "Pull" Layer)
*   **Messages**: Always send via **REST POST** to `/messages`.
*   **Typing**: Send "start" and "stop" typing signals via REST to `/rooms/:id/typing` on a debounced timer.

---

## 4. Key SaaS Polishing Features

1.  **Optimistic UI**: When sending a message, show it in the list immediately with a "sending" state. If the API fails, show an error; if it succeeds, update it with the final ID.
2.  **Dynamic Sidebar Sorting**: Always move a room to the top of the Sidebar list when a new message arrives.
3.  **Image/File Buffering**: Show a loading placeholder for images until the local file is uploaded and the final URL is received.
4.  **Smart Scrolling**: Auto-scroll to the bottom only if the user is already at the bottom or if they sent the message. If they are reading old messages, show a "New Message Arrived" pill instead of scrolling automatically.
