/**
 * 실시간 이벤트 시스템 (Server-Sent Events용)
 * 
 * 메모리 기반 이벤트 관리
 */

import { EventEmitter } from 'events';

// 채팅 메시지 타입
type ChatMessageEvent = {
  chatRoomId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
    placeId?: string | null;
    placeName?: string | null;
    placeAddress?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
};

// 전역 이벤트 이미터
class ChatEventEmitter extends EventEmitter {
  // 새 메시지 브로드캐스트
  broadcastMessage(event: ChatMessageEvent) {
    this.emit(`chat:${event.chatRoomId}`, event);
  }

  // 특정 채팅방 구독
  subscribeToRoom(chatRoomId: string, callback: (event: ChatMessageEvent) => void) {
    this.on(`chat:${chatRoomId}`, callback);
  }

  // 구독 해제
  unsubscribeFromRoom(chatRoomId: string, callback: (event: ChatMessageEvent) => void) {
    this.off(`chat:${chatRoomId}`, callback);
  }
}

// 싱글톤 인스턴스
export const chatEvents = new ChatEventEmitter();


