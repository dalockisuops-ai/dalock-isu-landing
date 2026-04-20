'use client';

import { useState, useEffect } from 'react';

const DALOCK_APP_URL = 'https://dalock.kr/branch/isu-sadang';
const BRANCH_NAVER_URL = 'https://naver.me/xnrINaXG';

const unitTypes = [
  {
    id: 'small',
    name: '스몰',
    description: '상자 10개 정도',
    icon: '📦',
    detail: '작은 짐 보관에 딱 맞아요',
  },
  {
    id: 'cube',
    name: '큐브',
    description: '캐리어 + 박스 여러 개',
    icon: '📦📦',
    detail: '여행 짐이나 계절 옷 보관',
  },
  {
    id: 'medium',
    name: '미디움',
    description: '원룸 짐 정도',
    icon: '📦📦📦',
    detail: '이사 전후 짐 보관에 적합',
  },
  {
    id: 'slim',
    name: '슬림',
    description: '1.5룸 짐 정도',
    icon: '🏠',
    detail: '가전·가구까지 여유있게',
  },
  {
    id: 'large',
    name: '라지',
    description: '투룸 이상 짐',
    icon: '🏠🏠',
    detail: '넉넉한 공간이 필요할 때',
  },
];

export default function Home() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(id);
    trackEvent('page_view', { session_id: id });
  }, []);

  const trackEvent = async (eventType: string, data: Record<string, any>) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          ...data,
        }),
      });
    } catch (err) {
      console.error('Track error:', err);
    }
  };

  const handleUnitClick = (unitId: string, unitName: string) => {
    trackEvent('unit_click', { unit_id: unitId, unit_name: unitName });
    setTimeout(() => {
      window.location.href = DALOCK_APP_URL;
    }, 100);
  };

  const handleReserveClick = () => {
    trackEvent('reserve_click', {});
    window.location.href = DALOCK_APP_URL;
  };

  const handleMapClick = () => {
    trackEvent('map_click', {});
    window.open(BRANCH_NAVER_URL, '_blank');
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <section className="px-6 pt-12 pb-10 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-md mx-auto animate-fade-in-up">
          <div className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full mb-4">
            이수역 7번 출구 도보 2분
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            다락 이수사당점
          </h1>
          <p className="text-gray-600 text-base mb-6">
            24시간 언제든 내 짐을 꺼낼 수 있는<br />
            보안 셀프스토리지
          </p>
          <button
            onClick={handleMapClick}
            className="flex items-center text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            <span className="mr-2">📍</span>
            서울 동작구 동작대로23길 7 · 지도보기
          </button>
        </div>
      </section>

      {/* Unit Selection */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">어떤 크기가 필요하세요?</h2>
          <p className="text-sm text-gray-500 mb-6">
            눌러서 바로 다락 앱에서 예약하세요
          </p>

          <div className="space-y-3">
            {unitTypes.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleUnitClick(unit.id, unit.name)}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-100 hover:border-primary rounded-xl p-4 transition group"
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-4">{unit.icon}</div>
                  <div className="text-left">
                    <div className="font-bold text-base">{unit.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {unit.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {unit.detail}
                    </div>
                  </div>
                </div>
                <div className="text-primary group-hover:translate-x-1 transition">
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-10 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-6">다락 이수사당점만의 장점</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">🕐</div>
              <div>
                <div className="font-semibold">24시간 출입 가능</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  언제든 내 짐을 꺼낼 수 있어요
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🔒</div>
              <div>
                <div className="font-semibold">CCTV 24시간 보안</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  안전하게 보관됩니다
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🌡️</div>
              <div>
                <div className="font-semibold">온습도 관리</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  곰팡이 걱정 없는 쾌적한 환경
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">📱</div>
              <div>
                <div className="font-semibold">앱으로 간편 예약</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  비대면으로 계약부터 출입까지
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">오시는 길</h2>
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">주소</div>
              <div className="font-semibold">서울 동작구 동작대로23길 7</div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">대중교통</div>
              <div className="font-semibold">이수역 7번 출구 도보 2분</div>
            </div>
            <button
              onClick={handleMapClick}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 font-semibold text-sm hover:bg-gray-50 transition"
            >
              네이버 지도에서 보기
            </button>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
        <div className="max-w-md mx-auto
