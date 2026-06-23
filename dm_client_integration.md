# Client-Side API Integration Guide: One-to-One Conversation

This document outlines the exact execution flow, endpoints, request requirements, and response formats needed for a client application to implement a full one-to-one (Direct Message) chat integration.

---

## Overall Execution Flow

1.  **Authentication & WebSocket Connection:** The client logs in, obtains a standard API JWT, then asks the API for a Centrifugo connection token, and finally establishes the main WebSocket connection.
2.  **Starting a DM (Get/Create Room):** The user clicks on another user in a list or search to start chatting. The client asks the API to find or create the DM room for that user.
3.  **Real-Time Listening (Subscribing):** With the room ID obtained, the client requests a private subscription token for that room and commands the WebSocket to start listening to the `room:<roomId>` channel.
4.  **Loading History:** The client fetches the past messages for this room to display on the screen.
5.  **Sending Messages:** The user types a message and hits send. The client uses the REST API to post the message.
6.  **Receiving Messages:** The client listens to incoming WebSocket events and updates the UI instantly when the other person replies.

---

## Step 1: Authentication & WebSocket Connection

Before sending or receiving messages, the client must establish an authenticated session and a live WebSocket line.

### 1a. REST API Authentication (Assumption)
You must obtain your main `Authorization: Bearer <token>` from the login process (e.g., `POST /api/v1/auth/login`). This JWT is used in the headers of **every** REST API call below.

### 1b. Get WebSocket Connection Token
Fetch the Centrifugo token to establish the WebSocket link.

*   **Endpoint:** `GET /api/v1/centrifugo/token`
*   **Headers:** `Authorization: Bearer <your_login_jwt>`
*   **Response Format:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR..."
      }
    }
    ```

### 1c. Establish WebSocket Connection
Connect to the Centrifugo WebSocket server using the token acquired in 1b.
*   **WebSocket URL:** `ws://<domain>:8000/connection/websocket` (or your specific URL)
*   **Client Implementation Example (using `centrifuge-js`):**
    ```javascript
    const centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket', {
      token: centrifugoTokenData.token
    });
    centrifuge.connect();
    ```

---

## Step 2: Finding or Creating a DM Room

When "User A" wants to chat with "User B", they only need "User B's" username. The API guarantees that a DM room is either found or created.

*   **Endpoint:** `GET /api/v1/rooms/dm/:username`
    *   *Example:* `GET /api/v1/rooms/dm/john_doe`
*   **Headers:** `Authorization: Bearer <your_login_jwt>`
*   **Response Format:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "room": {
          "_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "d",
          "memberIds": ["user_a_id", "user_b_id"],
          "usernames": ["user_a", "john_doe"],
          "memberCount": 2,
          "createdBy": "user_a_id",
          "createdAt": "2023-10-27T10:00:00.000Z",
          "updatedAt": "2023-10-27T10:00:00.000Z"
        }
      }
    }
    ```
*   **Integration Action:** Extract and save `room._id`. This is the `<roomId>` used for all subsequent steps.

---

## Step 3: Subscribing to the Room (Real-time Listening)

Once you have the `roomId`, you must instruct the WebSocket to lock onto that room's channel (`room:<roomId>`). Because it is a private room, you require a specialized subscription token.

### 3a. Get Subscription Token
*   **Endpoint:** `POST /api/v1/centrifugo/subscription-token`
*   **Headers:** `Authorization: Bearer <your_login_jwt>`, `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "channel": "room:<roomId>" // e.g., "room:550e8400-e29b-41d4-a716-446655440000"
    }
    ```
*   **Response Format:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR..."
      }
    }
    ```

### 3b. Bind the WebSocket to the Channel
*   **Client Implementation Example (using `centrifuge-js`):**
    ```javascript
    const channelName = `room:${roomId}`;
    const sub = centrifuge.newSubscription(channelName, {
      token: subscriptionTokenData.token
    });

    sub.on('publication', function(ctx) {
      // ctx.data contains the real-time payload (new message, typing event, etc)
      handleIncomingWebSocketEvent(ctx.data);
    });

    sub.subscribe();
    ```

---

## Step 4: Loading Message History

Fetch previous messages to render the chat window immediately.

*   **Endpoint:** `GET /api/v1/rooms/:roomId/messages`
    *   *Optional Query Params:* `?limit=50&before=<messageId>` (for pagination)
*   **Headers:** `Authorization: Bearer <your_login_jwt>`
*   **Response Format:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "data": {
        "messages": [
          {
            "_id": "msg_12345",
            "roomId": "550e8400-...",
            "msg": "Hey John, how are you?",
            "u": {
              "_id": "user_a_id",
              "username": "user_a"
            },
            "ts": "2023-10-27T10:05:00.000Z",
            "isDeleted": false,
            "tcount": 0,
            "mentions": [],
            "replyTo": null,
            "attachments": []
          }
        ],
        "total": 1,
        "hasMore": false
      }
    }
    ```
*   **Integration Action:** Render these messages in the UI.

---

## Step 5: Sending Messages

When a user submits text, call the REST API. **Do not send messages through the WebSocket.**

*   **Endpoint:** `POST /api/v1/messages`
*   **Headers:** `Authorization: Bearer <your_login_jwt>`, `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "msg": "I am sending you a new message right now!"
    }
    ```
    *Note: `attachments` (Array) and `replyTo` (Object) are optional fields.*
*   **Response Format:**
    ```json
    {
      "success": true,
      "statusCode": 201,
      "data": {
        "message": {
          "_id": "msg_98765",
          "roomId": "550e8400-...",
          "msg": "I am sending you a new message right now!",
          "u": {
            "_id": "user_a_id",
            "username": "user_a"
          },
          "ts": "2023-10-27T10:10:00.000Z",
          "isDeleted": false,
          ...
        }
      }
    }
    ```
*   **Integration Action:** Optimistically render the message in the UI or wait for the REST response/WebSocket echo. Wait for success before clearing the input box.

---

## Step 6: Receiving Real-time Updates

Because you subscribed to `room:<roomId>` in Step 3, Centrifugo will instantly push events to the `publication` handler whenever the other user (or your backend) takes action in the room.

### Expected WebSocket Payloads (`ctx.data`)

#### 6a. New Message Arrives
```json
{
  "type": "message",
  "messageId": "msg_112233",
  "text": "Hello User A, I received your message!",
  "senderId": "user_b_id",
  "senderUsername": "john_doe",
  "roomId": "550e8400-...",
  "createdAt": "2023-10-27T10:10:05.000Z",
  "attachments": [],
  "replyTo": null
}
```
*   **Integration Action:** Append this object to your local `messages` state list so it appears on screen without refreshing.

#### 6b. User Starts Typing
```json
{
  "type": "typing_start",
  "userId": "user_b_id",
  "username": "john_doe",
  "roomId": "550e8400-..."
}
```
*   **Integration Action:** Show "john_doe is typing..." in the UI.

#### 6c. User Stops Typing
```json
{
  "type": "typing_stop",
  "userId": "user_b_id",
  "username": "john_doe",
  "roomId": "550e8400-..."
}
```
*   **Integration Action:** Hide the typing indicator.

#### 6d. Message Read Receipt
```json
{
  "type": "read_receipt",
  "userId": "user_b_id",
  "roomId": "550e8400-...",
  "lastReadMessageId": "msg_98765"
}
```
*   **Integration Action:** Update the last sent message UI from "Delivered" to "Read" (e.g., changing from a single tick to double-blue ticks).
