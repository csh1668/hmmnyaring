/**
 * 여행 코스 지도 컴포넌트
 * 
 * 순서가 있는 마커와 Polyline으로 경로를 시각화합니다.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '@/lib/kakao-map';
import { Loader2, MapPin } from 'lucide-react';

type TourSpot = {
  id: string;
  order: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string | null;
};

type TourCourseMapProps = {
  spots: TourSpot[];
  height?: string;
  className?: string;
  showPolyline?: boolean;
  onSpotClick?: (spot: TourSpot) => void;
};

export function TourCourseMap({
  spots,
  height = '500px',
  className = '',
  showPolyline = true,
  onSpotClick,
}: TourCourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const customOverlaysRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || spots.length === 0) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadKakaoMapScript();

        const { kakao } = window;
        if (!kakao?.maps) {
          throw new Error('Kakao Maps API를 로드할 수 없습니다.');
        }

        // 순서대로 정렬
        const sortedSpots = [...spots].sort((a, b) => a.order - b.order);

        // 지도 중심 계산 (첫 번째 지점)
        const mapOption = {
          center: new kakao.maps.LatLng(
            sortedSpots[0].latitude,
            sortedSpots[0].longitude
          ),
          level: 5,
        };

        const map = new kakao.maps.Map(mapRef.current!, mapOption);
        mapInstanceRef.current = map;

        // 기존 마커 및 오버레이 제거
        markersRef.current.forEach((marker) => marker.setMap(null));
        customOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
        markersRef.current = [];
        customOverlaysRef.current = [];

        const linePath: any[] = [];

        sortedSpots.forEach((spot, index) => {
          const position = new kakao.maps.LatLng(spot.latitude, spot.longitude);
          linePath.push(position);

          // 커스텀 마커 HTML (순서 번호 표시)
          const markerContent = document.createElement('div');
          markerContent.style.cssText = `
            width: 40px;
            height: 40px;
            background: #FF6B3D;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          `;
          markerContent.textContent = `${index + 1}`;

          // 호버 효과
          markerContent.addEventListener('mouseenter', () => {
            markerContent.style.transform = 'scale(1.1)';
          });
          markerContent.addEventListener('mouseleave', () => {
            markerContent.style.transform = 'scale(1)';
          });

          // CustomOverlay로 마커 생성
          const customMarker = new kakao.maps.CustomOverlay({
            position: position,
            content: markerContent,
            yAnchor: 1,
          });

          customMarker.setMap(map);
          customOverlaysRef.current.push(customMarker);

          // 인포윈도우 생성
          const infoContent = `
            <div style="padding:12px;min-width:200px;max-width:300px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="
                  display:inline-block;
                  width:28px;
                  height:28px;
                  background:#FF6B3D;
                  color:white;
                  border-radius:50%;
                  text-align:center;
                  line-height:28px;
                  font-weight:bold;
                  font-size:14px;
                ">${index + 1}</span>
                <strong style="font-size:16px;">${spot.name}</strong>
              </div>
              <p style="margin:8px 0 0 0;font-size:13px;color:#666;line-height:1.4;">
                ${spot.description.length > 100 ? spot.description.substring(0, 100) + '...' : spot.description}
              </p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#999;">
                📍 ${spot.address}
              </p>
            </div>
          `;

          const infowindow = new kakao.maps.InfoWindow({
            content: infoContent,
            removable: false,
          });

          // 마커 클릭 이벤트
          markerContent.addEventListener('click', () => {
            // 다른 인포윈도우 닫기
            const infoWindows = document.querySelectorAll('.infowindow');
            infoWindows.forEach((iw) => {
              if (iw.parentElement) {
                iw.parentElement.style.display = 'none';
              }
            });

            // InfoWindow를 position으로 열기
            infowindow.open(map, new kakao.maps.Marker({ position }));

            // 콜백 실행
            if (onSpotClick) {
              onSpotClick(spot);
            }
          });

          // 첫 번째 마커는 기본적으로 인포윈도우 열기
          if (index === 0) {
            infowindow.open(map, new kakao.maps.Marker({ position }));
          }
        });

        // Polyline으로 경로 연결
        if (showPolyline && sortedSpots.length > 1) {
          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: '#FF6B3D',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          });

          polyline.setMap(map);
          polylineRef.current = polyline;
        }

        // 모든 지점이 보이도록 지도 범위 조정
        if (sortedSpots.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          sortedSpots.forEach((spot) => {
            bounds.extend(new kakao.maps.LatLng(spot.latitude, spot.longitude));
          });
          map.setBounds(bounds);

          // 약간의 패딩 추가
          setTimeout(() => {
            const level = map.getLevel();
            map.setLevel(level + 1);
          }, 100);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('TourCourseMap 초기화 실패:', err);
        setError('지도를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      // 정리
      markersRef.current.forEach((marker) => marker.setMap(null));
      customOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [spots, showPolyline, onSpotClick]);

  if (spots.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">표시할 장소가 없습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* 경로 정보 */}
      {!isLoading && spots.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm font-medium">{spots.length} spots</p>
          <p className="text-xs text-muted-foreground mt-1">
            {spots[0].name} → {spots[spots.length - 1].name}
          </p>
        </div>
      )}
    </div>
  );
}

