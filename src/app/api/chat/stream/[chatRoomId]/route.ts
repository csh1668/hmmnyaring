/**
 * SSE (Server-Sent Events) API for real-time chat
 * 
 * 실시간 채팅 메시지 스트리밍
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { chatEvents } from '@/lib/events';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatRoomId: string }> }
) {
  const { chatRoomId } = await params;

  // 인증 확인
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 채팅방 권한 확인
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      tourRequest: {
        select: {
          travelerId: true,
          guideId: true,
        },
      },
    },
  });

  if (!chatRoom) {
    return new Response('Not Found', { status: 404 });
  }

  if (
    chatRoom.tourRequest.travelerId !== session.user.id &&
    chatRoom.tourRequest.guideId !== session.user.id
  ) {
    return new Response('Forbidden', { status: 403 });
  }

  // SSE 스트림 설정
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // 하트비트 (연결 유지)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 15000);

      // 메시지 리스너
      const messageListener = (event: any) => {
        // 본인이 보낸 메시지는 스킵 (이미 낙관적 업데이트로 표시됨)
        if (event.message.senderId === session.user.id) {
          return;
        }

        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // 이벤트 구독
      chatEvents.subscribeToRoom(chatRoomId, messageListener);

      // 연결 종료 시 정리
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        chatEvents.unsubscribeFromRoom(chatRoomId, messageListener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}


