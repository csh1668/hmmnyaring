# Kakao Map 기능 사용 가이드

## 🎉 구현 완료 기능

### 1. 채팅에서 장소 공유
- 채팅창 입력란 좌측의 📍 버튼 클릭
- 장소 검색 (예: "성심당", "대전역", "한밭수목원")
- 검색 결과에서 원하는 장소 선택
- 지도 미리보기로 확인
- "공유하기" 버튼 클릭
- 상대방에게 지도 카드 형태로 전송됨

### 2. 장소 메시지 기능
- 지도 카드 클릭 시 확대 모달 표시
- "Kakao 지도에서 보기" 버튼으로 Kakao 지도 앱 연결
- 실제 길찾기 가능

### 3. 경로 표시
- `RouteMap` 컴포넌트로 여러 장소를 순서대로 표시
- Polyline으로 경로 연결
- 각 지점에 번호 표시 (①, ②, ③...)

## 📦 구현된 컴포넌트

### 1. KakaoMap
기본 지도 컴포넌트

```tsx
import { KakaoMap } from '@/components/map/KakaoMap';

<KakaoMap
  center={{ latitude: 36.3285, longitude: 127.4258 }}
  level={3}
  markers={[
    {
      latitude: 36.3285,
      longitude: 127.4258,
      title: "성심당",
      content: "대전 대표 빵집"
    }
  ]}
  height="400px"
/>
```

### 2. PlaceSearch
장소 검색 컴포넌트

```tsx
import { PlaceSearch } from '@/components/map/PlaceSearch';

<PlaceSearch
  onSelect={(place) => {
    console.log('선택된 장소:', place);
  }}
  placeholder="장소를 검색하세요"
  autoFocus
/>
```

### 3. RouteMap
경로 표시 컴포넌트

```tsx
import { RouteMap } from '@/components/map/RouteMap';

<RouteMap
  points={[
    {
      latitude: 36.3285,
      longitude: 127.4258,
      name: "성심당",
      address: "대전 중구 은행동"
    },
    {
      latitude: 36.3325,
      longitude: 127.4353,
      name: "대전역",
      address: "대전 동구 중앙로"
    }
  ]}
  showPolyline={true}
  height="500px"
/>
```

### 4. ShareLocationModal
채팅용 장소 공유 모달

```tsx
import { ShareLocationModal } from '@/components/chat/ShareLocationModal';
import { PlaceSearchResult } from '@/components/map/PlaceSearch';

<ShareLocationModal
  onShare={(place: PlaceSearchResult) => {
    // 장소 공유 처리
    console.log('공유할 장소:', place);
  }}
/>
```

### 5. ChatMessage
장소 정보 포함 채팅 메시지

```tsx
import { ChatMessage } from '@/components/chat/ChatMessage';

<ChatMessage
  message={{
    id: "msg-1",
    content: "여기서 만나요!",
    sender: {...},
    createdAt: new Date(),
    // 장소 정보 (선택적)
    placeId: "12345",
    placeName: "성심당",
    placeAddress: "대전 중구 은행동",
    latitude: 36.3285,
    longitude: 127.4258
  }}
  isOwnMessage={false}
/>
```

## 🔧 유틸리티 함수

### loadKakaoMapScript()
Kakao Maps SDK를 동적으로 로드

```tsx
import { loadKakaoMapScript } from '@/lib/kakao-map';

useEffect(() => {
  loadKakaoMapScript()
    .then(() => {
      console.log('Kakao Maps SDK 로드 완료');
    })
    .catch((error) => {
      console.error('로드 실패:', error);
    });
}, []);
```

### calculateDistance()
두 좌표 사이의 거리 계산 (미터 단위)

```tsx
import { calculateDistance } from '@/lib/kakao-map';

const distance = calculateDistance(36.3285, 127.4258, 36.3325, 127.4353);
console.log(`거리: ${distance}m`); // 거리: 523m
```

## 💡 사용 예시

### 예시 1: 투어 경로 계획
```tsx
'use client';

import { RouteMap } from '@/components/map/RouteMap';

export default function TourPlanPage() {
  const tourRoute = [
    { latitude: 36.3285, longitude: 127.4258, name: "성심당" },
    { latitude: 36.3668, longitude: 127.3895, name: "한밭수목원" },
    { latitude: 36.3726, longitude: 127.3840, name: "엑스포 과학공원" },
  ];

  return (
    <div>
      <h1>오늘의 투어 코스</h1>
      <RouteMap points={tourRoute} height="600px" />
    </div>
  );
}
```

### 예시 2: 추천 장소 리스트
```tsx
import { KakaoMap } from '@/components/map/KakaoMap';

export default function RecommendedPlacesPage() {
  const places = [
    { id: 1, name: "성심당", lat: 36.3285, lng: 127.4258 },
    { id: 2, name: "대전역", lat: 36.3325, lng: 127.4353 },
  ];

  return (
    <KakaoMap
      center={{ latitude: 36.35, longitude: 127.4 }}
      level={5}
      markers={places.map(p => ({
        latitude: p.lat,
        longitude: p.lng,
        title: p.name
      }))}
    />
  );
}
```

## 📱 채팅에서 사용하기

1. 채팅창에서 📍 (지도 아이콘) 버튼 클릭
2. 장소 이름으로 검색 (예: "성심당")
3. 검색 결과에서 선택
4. 지도 미리보기 확인
5. "공유하기" 버튼 클릭
6. 상대방에게 지도 카드로 전송됨

## 🔍 검색 가능한 장소

- **대전 명소**: 성심당, 대전역, 한밭수목원, 엑스포 과학공원, 유성온천, 대청호
- **음식점**: "대전 맛집", "성심당 본점", "칼국수"
- **카페**: "대전 카페", "은행동 카페"
- **관공서**: "대전시청", "대전역"
- **기타**: 건물명, 도로명, 지번 주소 모두 검색 가능

## ⚙️ 환경변수 설정

`.env` 파일에 다음 내용 추가:

```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY="발급받은_JavaScript_키"
```

## 🐛 문제 해결

### 지도가 로드되지 않을 때
1. API 키가 올바른지 확인
2. Kakao Developers에서 플랫폼(도메인) 등록 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 장소 검색이 안 될 때
1. 인터넷 연결 확인
2. 검색어를 구체적으로 입력 (예: "대전 성심당" 대신 "성심당")
3. 한글/영문 모두 시도

### 지도가 느릴 때
- 마커가 너무 많으면 (100개 이상) 성능 저하 가능
- `level` prop을 높여서 더 넓은 범위 표시
- 필요한 마커만 표시하도록 필터링

## 📊 데이터베이스 스키마

### Message 모델에 추가된 필드

```prisma
model Message {
  // 기존 필드...
  
  // 장소 정보 (선택적)
  placeId      String? // Kakao Place ID
  placeName    String?
  placeAddress String?
  latitude     Float?
  longitude    Float?
}
```

## 🚀 향후 개선 가능 사항

- [ ] 경로 검색 API 연동 (실제 길찾기)
- [ ] 거리/소요시간 계산
- [ ] 즐겨찾기 장소 저장
- [ ] 장소별 메모 추가
- [ ] 다중 경로 비교 기능

---

**문의사항이나 버그는 Issue로 등록해주세요!**


