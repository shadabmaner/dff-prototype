import { useState, useEffect, useCallback, useRef } from 'react';
import { Centrifuge } from 'centrifuge';
import { chatApiClient } from '@/lib/chat-api-client';
import { useAuth } from '@/contexts/auth-context';
import { useChatStore } from '@/store/chat-store';
import { ChatMessage, ChatRoom } from '@/types/chat';

export function useChat() {
  const { user } = useAuth();
  const chatStore = useChatStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatProfile, setChatProfile] = useState<any>(null);

  const centrifugeRef = useRef<Centrifuge | null>(null);
  const subRef = useRef<any>(null);

  // Initialize Centrifuge and Chat Profile
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const { data } = await chatApiClient.get('/users/me');
        if (data && mounted) setChatProfile(data.data || data); // Handle both wrapped and unwrapped data
      } catch (err) {
        console.error('Failed to fetch chat profile:', err);
      }
    };

    const initCentrifuge = async () => {
      try {
        const { data: tokenRes } = await chatApiClient.get('/centrifugo/token');
        // Handle both wrapped and unwrapped data
        const resData = tokenRes.data || tokenRes;
        const token = resData.token;
        if (!token) throw new Error('Failed to get centrifugo token');
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://centrifugal.onpointsoft.com/connection/websocket';

        const centrifuge = new Centrifuge(wsUrl, {
          token,
        });

        centrifuge.on('connected', (ctx) => {
          console.log('Centrifuge connected:', ctx);
          // Set user status to online when connected
          chatApiClient.post('/users/me/status', { status: 'online' }).catch(() => {});
        });

        centrifuge.on('disconnected', (ctx) => {
          console.log('Centrifuge disconnected:', ctx);
        });

        // 1. Subscribe to presence channel for global status updates
        try {
          const { data: presenceTokenRes } = await chatApiClient.post('/centrifugo/subscription-token', {
            channel: 'presence'
          });
          const ptData = presenceTokenRes.data || presenceTokenRes;
          if (ptData.token) {
            const presenceSub = centrifuge.newSubscription('presence', {
              token: ptData.token
            });
            presenceSub.on('publication', (ctx) => {
              const payload = ctx.data;
              if (payload.type === 'presence_change' || payload.type === 'status_change') {
                const status = payload.status || (payload.type === 'presence_change' ? 'online' : 'offline');
                console.log(`[Presence] User ${payload.userId} status changed to ${status}`, payload);
                chatStore.updatePresence(payload.userId, { status });
              }
            });
            presenceSub.subscribe();
          }
        } catch (err) {
          console.error('Presence subscription error:', err);
        }

        // 2. Fetch initial presence for all relevant users
        const fetchInitialPresence = async () => {
          try {
            const { data: presenceRes } = await chatApiClient.get('/users/presence');
            const pData = presenceRes.data || presenceRes;
            const users = pData.users || [];
            users.forEach((u: any) => {
              if (u.userId || u._id) {
                chatStore.updatePresence(u.userId || u._id, { status: u.status });
              }
            });
          } catch (err) {
            console.error('Failed to fetch initial presence:', err);
          }
        };
        fetchInitialPresence();

        centrifuge.connect();

        if (mounted) {
          centrifugeRef.current = centrifuge;
        } else {
          centrifuge.disconnect();
        }
      } catch (err: any) {
        console.error('Centrifuge init error:', err);
        if (mounted) setError(err.message || 'Failed to connect to chat server');
      }
    };

    if (user) {
      fetchProfile();
      initCentrifuge();
    }

    return () => {
      mounted = false;
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
        centrifugeRef.current = null;
        // set user status to offline on cleanup
        chatApiClient.post('/users/me/status', { status: 'offline' }).catch(() => {});
      }
    };
  }, [user]);

  // Identity Refs to keep WebSocket handlers stable without re-subscriptions
  const identityRef = useRef({ id: user?.id, username: (user as any)?.name || user?.email?.split('@')[0] });
  useEffect(() => {
    identityRef.current = { 
      id: chatProfile?._id || user?.id, 
      username: chatProfile?.username || (user as any)?.name || user?.email?.split('@')[0] 
    };
  }, [chatProfile, user]);

  // Handle Room selection and loading
  const selectRoom = useCallback(async (identifier: string, type: 'id' | 'username' = 'username') => {
    if (!centrifugeRef.current) return;
    setIsLoading(true);
    setError(null);

    const centrifuge = centrifugeRef.current;

    try {
      let roomId = type === 'id' ? identifier : null;
      let username = type === 'username' ? identifier : null;

      if (type === 'username') {
        const { data: roomRes } = await chatApiClient.get(`/rooms/dm/${username}`);
        const responseBody = roomRes.data || roomRes;
        const currentRoom = responseBody.data?.room || responseBody.room || responseBody.data || responseBody;
        roomId = currentRoom?._id || currentRoom?.roomId || currentRoom?.id;
        if (!roomId) throw new Error('Could not identify the clinical channel ID.');
      }

      if (!roomId) throw new Error('Channel ID is required.');
      
      chatStore.setActiveRoomId(roomId);
      
      // Refresh rooms list after selecting a room to ensure it appears in sidebar
      try {
        const { data: roomsRes } = await chatApiClient.get('/rooms');
        const roomsResponseBody = roomsRes.data || roomsRes;
        const rooms = roomsResponseBody.rooms || (Array.isArray(roomsResponseBody) ? roomsResponseBody : []);
        
        if (rooms.length >= 0) {
          chatStore.setRooms(rooms);
          chatStore.refreshRoomSorting();
        }
      } catch (err) {
        console.error('Failed to refresh rooms after selection:', err);
      }
      const channelName = `room:${roomId}`;

      // 2. Load History if not already cached
      if (!chatStore.messages[roomId]) {
        const { data: historyRes } = await chatApiClient.get(`/rooms/${roomId}/messages?limit=50`);
        const hData = historyRes.data || historyRes;
        if (hData.success || hData.messages) {
          const msgs = hData.messages || hData.data?.messages || [];
          chatStore.setMessages(roomId, msgs);
        }
      }

      // 3. Subscription handling
      if (subRef.current) {
        subRef.current.unsubscribe();
        centrifuge.removeSubscription(subRef.current);
      }

      const { data: subTokenRes } = await chatApiClient.post('/centrifugo/subscription-token', {
        channel: channelName
      });
      
      const sData = subTokenRes.data || subTokenRes;
      const subToken = sData.token;
      if (!subToken) throw new Error('Failed to get subscription token');

      let sub = centrifuge.getSubscription(channelName);
      if (sub) {
        console.log(`[Chat] Removing existing subscription for ${channelName} to prevent collision.`);
        sub.unsubscribe();
        centrifuge.removeSubscription(sub);
      }
      
      sub = centrifuge.newSubscription(channelName, {
        token: subToken
      });

      sub.on('publication', (ctx) => {
        const payload = ctx.data;
        if (payload.type === 'message') {
          // Check if message ID already exists (could be added by REST response already)
          const currentMessages = chatStore.messages[payload.roomId] || [];
          if (currentMessages.some(m => m._id === payload.messageId)) {
            console.log(`[Chat] Message ${payload.messageId} already exists, skipping.`);
            return;
          }

          const { id: myId, username: myUsername } = identityRef.current;
          const isMe = (payload.senderId && payload.senderId === myId) || 
                       (payload.senderUsername && payload.senderUsername === myUsername);
          
          const newMsg: ChatMessage = {
            _id: payload.messageId,
            roomId: payload.roomId,
            msg: payload.text,
            u: { _id: payload.senderId, username: payload.senderUsername },
            ts: payload.createdAt,
            isDeleted: false,
            tcount: 0,
            mentions: [],
            replyTo: payload.replyTo,
            attachments: payload.attachments || [],
            readBy: []
          };

          if (isMe) {
            // Check for optimistic message match by text if it hasn't been updated with server ID yet
            const optimisticMsg = currentMessages.find(m => 
              (m.status === 'sending' && m.msg === payload.text) || 
              (m._id.startsWith('temp-') && m.msg === payload.text)
            );
            
            if (optimisticMsg) {
              console.log(`[Chat] Matching optimistic message ${optimisticMsg._id} with ${payload.messageId}`);
              chatStore.updateMessage(payload.roomId, optimisticMsg._id, { ...newMsg, status: 'sent' });
              return;
            }
          }
          
          chatStore.addMessage(payload.roomId, newMsg);
          chatStore.refreshRoomSorting();

          // If this is a new message from someone else and it's for our active room, mark it as read
          if (!isMe && payload.roomId === chatStore.activeRoomId) {
            chatApiClient.post(`/rooms/${payload.roomId}/read`).catch(() => {});
          }
        } else if (payload.type === 'typing_start') {
          if (payload.username !== identityRef.current.username) {
            chatStore.updatePresence(payload.userId, { status: 'online' });
            setIsTyping(true);
          }
        } else if (payload.type === 'typing_stop') {
          if (payload.username !== identityRef.current.username) {
            setIsTyping(false);
          }
        } else if (payload.type === 'read_receipt') {
          console.log(`[Chat] Received read receipt from ${payload.userId} for room ${payload.roomId}`);
          chatStore.markMessagesAsRead(payload.roomId, payload.userId, payload.lastReadMessageId);
        }
      });

      sub.subscribe();
      subRef.current = sub;
      await chatApiClient.post(`/rooms/${roomId}/read`).catch(() => {});
      
    } catch (err: any) {
      console.error('Room select error:', err);
      setError(err.message || 'Failed to open chat');
    } finally {
      setIsLoading(false);
    }
  }, [chatStore]);

  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    const roomId = chatStore.activeRoomId;
    if (!roomId) return;
    try {
      await chatApiClient.post(`/rooms/${roomId}/typing`, {
        isTyping: isTyping
      });
    } catch (err) {
      // Silently fail for typing indicators
    }
  }, [chatStore.activeRoomId]);

  const sendMessage = useCallback(async (text: string) => {
    const roomId = chatStore.activeRoomId;
    if (!roomId) return;
    
    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const myId = chatProfile?._id || user?.id || '';
    const myUsername = chatProfile?.username || (user as any)?.name || user?.email?.split('@')[0] || 'me';
    
    const optimisticMsg: ChatMessage = {
      _id: tempId,
      roomId,
      msg: text,
      u: { _id: myId, username: myUsername },
      ts: new Date().toISOString(),
      isDeleted: false,
      tcount: 0,
      mentions: [],
      replyTo: null,
      attachments: [],
      status: 'sending'
    };
    
    chatStore.addMessage(roomId, optimisticMsg);
    chatStore.refreshRoomSorting();

    try {
      const { data } = await chatApiClient.post('/messages', {
        roomId,
        msg: text
      });
      
      const responseBody = data.data || data;
      const serverMsg = responseBody.message || responseBody;
      
      if (serverMsg && serverMsg._id) {
        // Robust update: check if the WebSocket already added this message with the real ID
        // (This happens if REST responds AFTER the WebSocket publication arrives)
        const currentMessages = useChatStore.getState().messages[roomId] || [];
        const alreadyAddedByWS = currentMessages.some(m => m._id === serverMsg._id && m._id !== tempId);

        if (alreadyAddedByWS) {
          console.log(`[Chat] Message ${serverMsg._id} already added by WS, removing temp ${tempId}`);
          chatStore.removeMessage(roomId, tempId);
        } else {
          chatStore.updateMessage(roomId, tempId, { 
            status: 'sent', 
            _id: serverMsg._id,
            ts: serverMsg.ts || serverMsg.createdAt
          });
        }
      }
      
      // Refresh rooms list after sending message to ensure new conversations appear in sidebar
      try {
        const { data: roomsRes } = await chatApiClient.get('/rooms');
        const roomsResponseBody = roomsRes.data || roomsRes;
        const rooms = roomsResponseBody.rooms || (Array.isArray(roomsResponseBody) ? roomsResponseBody : []);
        
        if (rooms.length >= 0) {
          chatStore.setRooms(rooms);
          chatStore.refreshRoomSorting();
        }
      } catch (err) {
        console.error('Failed to refresh rooms after sending message:', err);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      chatStore.updateMessage(roomId, tempId, { status: 'error' });
      throw err;
    }
  }, [chatStore.activeRoomId, user, chatStore]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await chatApiClient.get('/rooms');
        const responseBody = data.data || data;
        const rooms = responseBody.rooms || (Array.isArray(responseBody) ? responseBody : []);
        
        if (rooms.length >= 0) {
          chatStore.setRooms(rooms);
          chatStore.refreshRoomSorting();
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    if (user) fetchRooms();
  }, [user]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    try {
      const { data } = await chatApiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
      if (data.success) {
        return data.data.users;
      }
      return [];
    } catch (err) {
      console.error('Search users error:', err);
      return [];
    }
  }, []);

  return {
    rooms: chatStore.rooms,
    activeRoomId: chatStore.activeRoomId,
    messages: chatStore.activeRoomId ? (chatStore.messages[chatStore.activeRoomId] || []) : [],
    isLoading,
    isTyping,
    error,
    selectRoom,
    sendMessage,
    sendTypingStatus,
    searchUsers,
    chatProfile,
    myUsername: chatProfile?.username || (user as any)?.name || user?.email?.split('@')[0] || 'me',
    myId: chatProfile?._id || user?.id || '',
    presence: chatStore.presence
  };
}
