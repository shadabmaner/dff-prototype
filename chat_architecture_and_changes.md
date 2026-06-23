# Chat Architecture & Implementation Summary

This document outlines the architecture of the integrated chat module and the key changes made to stabilize and enhance its functionality.

## Core Components

### 1. [use-chat.ts](file:///c:/workspace/projects/DR_APP/dr-admin/src/hooks/use-chat.ts) (The Orchestrator)
The primary hook that manages the lifecycle of the chat session.
- **Responsibilities**: WebSocket connection management (Centrifuge), room selection, message transmission, real-time event processing (typing, read receipts, presence), and user identity synchronization.
- **Key Logic**: Handles optimistic updates and deduplication to ensure a smooth, glitch-free messaging experience.

### 2. [chat-store.ts](file:///c:/workspace/projects/DR_APP/dr-admin/src/store/chat-store.ts) (The Brain)
A Zustand-based global store that manages the state of the chat application.
- **Responsibilities**: Storing room metadata, message history (per room), user presence statuses, and tracking the active room.
- **Actions**: Provides methods to add/update messages, mark messages as read, and refresh room sorting.

### 3. [page.tsx](file:///c:/workspace/projects/DR_APP/dr-admin/src/app/dashboard/doctor/messages/page.tsx) (The Face)
The main dashboard page that renders the chat interface.
- **Responsibilities**: Rendering the conversation list (sidebar), the chat window (header, message history, composer), and handling user interactions like searching for users and selecting rooms.
- **Visuals**: Displays real-time status dots, single/double ticks for message status, and optimistic message states.

---

## Summary of Key Changes & Fixes

### 1. Stability & Connectivity
- **DM 404 Resolution**: Fixed the logic to correctly identify users and rooms using usernames, preventing failed room initializations.
- **Token Handling**: Robustly handles Centrifugo connection and subscription tokens, supporting both wrapped and flat API response formats.
- **Global Presence**: Implemented automatic "online" status trigger on login and "offline" on disconnect. Added a subscription to a global `presence` channel to ensure real-time status updates are reflected across all conversation items instantly.
- **Subscription Reliability**: Fixed "Subscription already exists" error by checking for existing subscriptions before creating new ones.

### 2. Messaging Reliability
- **Deduplication**: Implemented a sophisticated matching system to prevent duplicate messages caused by race conditions between REST responses and WebSocket publications.
- **Chronological Ordering**: Ensured all message history and new publications are displayed in the correct order (oldest first).
- **Optimistic Updates**: Enhanced the composer to show immediate feedback while messages are being sent.

### 3. Real-time UI Enhancements
- **Seen Ticks (Read Receipts)**: Added support for `read_receipt` events. Messages now show a single tick (`✓`) when sent and a double tick (`✓✓`) when read by the partner.
- **Presence Indicators**: Replaced static status dots with real-time indicators that reflect the actual connection status of the chat partner.
- **Sidebar Clarity**: Corrected identification logic to ensure the sidebar always shows the partner's name and not the current user's.
