export interface ChatUser {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'dnd';
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  msg: string;
  u: ChatUser;
  ts: string;
  isDeleted: boolean;
  tcount: number;
  mentions: any[];
  replyTo: any;
  attachments: any[];
  status?: 'sending' | 'sent' | 'error';
  readBy?: string[];
}

export interface ChatRoom {
  _id: string;
  name?: string | null;
  type: string;
  memberIds: string[];
  usernames: string[];
  memberCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    msg: string;
    ts: string;
    username: string;
  };
  unreadCount?: number;
}

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}
