import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ChatRoom, ChatMessage } from '../store/chatStore';

export const createChatRoom = async (
  roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'memberCount'>
) => {
  try {
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...roomData,
      createdAt: Timestamp.now(),
      memberCount: 1,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getNearbyRooms = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
  try {
    const roomsRef = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);

    const nearbyRooms: ChatRoom[] = [];

    roomsSnapshot.forEach((docSnap) => {
      const room = docSnap.data();
      const distance = calculateDistance(
        latitude,
        longitude,
        room.latitude,
        room.longitude
      );

      if (distance <= radiusKm) {
        nearbyRooms.push({
          id: docSnap.id,
          name: room.name,
          description: room.description,
          createdBy: room.createdBy,
          createdAt: room.createdAt?.toDate() || new Date(),
          memberCount: room.memberCount || 0,
          latitude: room.latitude,
          longitude: room.longitude,
          radius: room.radius,
        });
      }
    });

    return nearbyRooms.sort((a, b) => a.memberCount - b.memberCount);
  } catch (error) {
    console.error('Error fetching nearby rooms:', error);
    throw error;
  }
};

export const subscribeToRoomMessages = (
  roomId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        roomId: doc.data().roomId,
        userId: doc.data().userId,
        userName: doc.data().userName,
        text: doc.data().text,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        attachments: doc.data().attachments,
      });
    });
    onMessagesUpdate(messages);
  });

  return unsubscribe;
};

export const sendMessage = async (
  roomId: string,
  userId: string,
  userName: string,
  text: string
) => {
  try {
    const message = {
      roomId,
      userId,
      userName,
      text,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'messages'), message);

    // Update room's last message timestamp
    const roomRef = doc(db, 'rooms', roomId);
    await setDoc(roomRef, { lastMessage: Timestamp.now() }, { merge: true });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const joinRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room does not exist');
    }

    // Add user to room members list
    await setDoc(
      doc(db, 'rooms', roomId, 'members', userId),
      {
        joinedAt: Timestamp.now(),
      }
    );

    // Increment member count
    const currentMembers = roomSnap.data().memberCount || 1;
    await setDoc(roomRef, { memberCount: currentMembers + 1 }, { merge: true });
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

export const leaveRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room does not exist');
    }

    // Remove user from members
    const memberRef = doc(db, 'rooms', roomId, 'members', userId);
    await setDoc(memberRef, { leftAt: Timestamp.now() }, { merge: true });

    // Decrement member count
    const currentMembers = roomSnap.data().memberCount || 1;
    await setDoc(roomRef, { memberCount: Math.max(0, currentMembers - 1) }, { merge: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
