import { create } from 'zustand';
import { ChatRoom, ChatMessage, PresenceStatus } from '@/types/chat';

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>; // roomId -> messages
  presence: Record<string, 'online' | 'offline'>; // userId -> status
  activeRoomId: string | null;
  
  setRooms: (rooms: ChatRoom[]) => void;
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setPresence: (userId: string, status: 'online' | 'offline') => void;
  setActiveRoomId: (roomId: string | null) => void;
  refreshRoomSorting: () => void;
  removeMessage: (roomId: string, messageId: string) => void;
  markMessagesAsRead: (roomId: string, userId: string, lastReadMessageId: string) => void;
  updatePresence: (userId: string, updates: Partial<PresenceStatus>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  messages: {},
  presence: {},
  activeRoomId: null,

  setRooms: (rooms) => set({ rooms }),
  
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map((r) => 
      r._id === roomId ? { ...r, ...updates } : r
    )
  })),

  addMessage: (roomId, message) => set((state) => {
    const roomMessages = state.messages[roomId] || [];
    // Check if message already exists (to prevent duplicates from WS and optimistic updates)
    if (roomMessages.some(m => m._id === message._id)) {
      return state;
    }
    
    return {
      messages: {
        ...state.messages,
        [roomId]: [...roomMessages, message]
      },
      // Update last message in the room list
      rooms: state.rooms.map(r => 
        r._id === roomId 
          ? { 
              ...r, 
              lastMessage: { msg: message.msg, ts: message.ts, username: message.u.username },
              unreadCount: state.activeRoomId === roomId ? 0 : (r.unreadCount || 0) + 1
            } 
          : r
      )
    };
  }),

  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages
    }
  })),

  updateMessage: (roomId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).map(m => 
        m._id === messageId ? { ...m, ...updates } : m
      )
    }
  })),

  setPresence: (userId, status) => set((state) => ({
    presence: {
      ...state.presence,
      [userId]: status
    }
  })),

  setActiveRoomId: (roomId) => set((state) => ({
    activeRoomId: roomId,
    // Clear unread count for active room
    rooms: state.rooms.map(r => 
      r._id === roomId ? { ...r, unreadCount: 0 } : r
    )
  })),

  refreshRoomSorting: () => set((state) => ({
    rooms: [...state.rooms].sort((a, b) => {
      const aTime = a.lastMessage?.ts || a.updatedAt;
      const bTime = b.lastMessage?.ts || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
  })),
  
  removeMessage: (roomId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).filter(m => m._id !== messageId)
    }
  })),

  markMessagesAsRead: (roomId, userId, lastReadMessageId) => set((state) => {
    const roomMessages = state.messages[roomId] || [];
    const lastReadIndex = roomMessages.findIndex(m => m._id === lastReadMessageId);
    
    if (lastReadIndex === -1) return state;

    return {
      messages: {
        ...state.messages,
        [roomId]: roomMessages.map((msg, index) => {
          if (index <= lastReadIndex) {
            const readBy = msg.readBy || [];
            if (!readBy.includes(userId)) {
              return { ...msg, readBy: [...readBy, userId] };
            }
          }
          return msg;
        })
      }
    };
  }),

  updatePresence: (userId, updates) => set((state) => ({
    presence: {
      ...state.presence,
      [userId]: (updates.status as any) || state.presence[userId]
    }
  })),
}));
