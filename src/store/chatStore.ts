import { create } from 'zustand';

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  memberCount: number;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  attachments?: string[];
  reactions?: Record<string, string[]>; // emoji -> userIds
}

export interface UserPresence {
  userId: string;
  userName: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}

export interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
}

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  presence: Record<string, UserPresence>; // userId -> presence
  typingUsers: TypingUser[];
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addRoom: (room: ChatRoom) => void;
  updateMessageReaction: (messageId: string, emoji: string, userId: string) => void;
  setPresence: (presence: Record<string, UserPresence>) => void;
  setTypingUsers: (users: TypingUser[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  presence: {},
  typingUsers: [],
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room],
    })),
  updateMessageReaction: (messageId: string, emoji: string, userId: string) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          const userIds = reactions[emoji] || [];
          const hasReacted = userIds.includes(userId);
          
          return {
            ...msg,
            reactions: {
              ...reactions,
              [emoji]: hasReacted
                ? userIds.filter((id) => id !== userId)
                : [...userIds, userId],
            },
          };
        }
        return msg;
      }),
    })),
  setPresence: (presence) => set({ presence }),
  setTypingUsers: (typingUsers) => set({ typingUsers }),
}));
