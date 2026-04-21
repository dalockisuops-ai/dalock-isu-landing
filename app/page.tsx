'use client';

import { useState, useEffect, Suspense } from 'react';

const DALOCK_APP_URL = 'https://dalock.kr/branch/isu-sadang';
const BRANCH_NAVER_URL = 'https://naver.me/xnrINaXG';
const PAGE_VERSION = 'v2';

const unitTypes = [
  {
    id: 'cube',
    name: '큐브',
    size: '0.9×0.9×1.0m',
    description: '캐리어·리빙박스 보관',
    detail: '계절 소품, 소형 잡화',
    image: '/unit-cube.png',
  },
  {
    id: 'slim',
    name: '슬림',
    size: '0.9×0.5×2.0m',
    description: '옷장처럼 사용 (행거)',
    detail: '계절 옷, 정장, 코트',
    image: '/unit-slim.png',
  },
  {
    id: 'small',
    name: '스몰',
    size: '0.9×0.9×2.0m',
    description: '높이 있는 물건 보관',
    detail: '골프용품, 계절 가전, 1~2인 짐',
    image: '/unit-small.png',
  },
  {
    id: 'medium',
    name: '미디움',
    size: '1.8×0.9×2.0m',
    description: '부피 있는 소형 가구',
    detail: '악기, 캠핑용품, 육아용품',
    image: '/unit-medium.png',
  },
  {
    id: 'large',
    name: '라지',
    size: '2.7×0.9×2.0m',
    description: '이삿짐·큰 짐 전체',
    detail: '3~4인 가족 짐, 캠핑 장비',
    image: '/unit-large.png',
  },
];

const useCases = [
  { icon: '📦', title: '이사 중', text: '새 집 들어가기 전 임시 보관' },
  { icon: '👗', title: '집이 좁아서', text: '계절 옷·비시즌 용품 보관' },
  { icon: '⛳', title: '취미 용품', text: '골프·캠핑·스키 장비 보관' },
  { icon: '📦', title: '소규모 사업자', text: '온라인 셀러 재고 보관' },
];

function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return '';
  try {
    let visitorId = localStorage.getItem('dalock_visitor_id');
    if (!visitorId) {
      visitorId = 'v-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('dalock_visitor_id', visitorId);
      localStorage.setItem('dalock_first_visit', new Date().toISOString());
    }
    return visitorId;
  } catch {
    return '';
  }
}

function getVisitorType() {
  if (typeof window === 'undefined') return 'new';
  try {
    const firstVisit = localStorage.getItem('dalock_first_visit');
    if (!firstVisit) return 'new';
    const firstVisitDate = new Date(firstVisit);
    const now = new Date();
    const diffMinutes = (now.getTime() - firstVisitDate.getTime()) / 1000 / 60;
    if (diffMinutes < 1) return 'new';
    return 'returning';
  } catch {
    return 'new';
  }
}

function HomeContent() {
  const [sessionId, setSessionId] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [visitorType, setVisitorType] = useState('new');
  const [utmSource, setUtmSource] = useState('');

  useEffect(() => {
    const sid = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    setSessionId(sid);

    const vid = getOrCreateVisitorId();
    setVisitorId(vid);

    const vType = getVisitorType();
    setVisitorType(vType);

    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || 'direct';
    setUtmSource(source);

    const baseData = {
      session_id: sid,
      visitor_id: vid,
      visitor_type: vType,
      utm_source: source,
      page_version: PAGE_VERSION,
    };

    trackEvent('page_view', baseData);

    const tracked = { 25: false, 50: false, 75: false, 100: false };
    const onScroll = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      );
      [25, 50, 75, 100].forEach((threshold) => {
        if (scrollPercent >= threshold && !tracked[threshold as keyof typeof tracked]) {
          tracked[threshold as keyof typeof tracked] = true;
          trackEvent('scroll_depth', { ...baseData, depth: threshold });
        }
      });
    };
    window.addEventListener('scroll', onScroll);

    const timeouts = [
      setTimeout(() => trackEvent('time_10s', baseData), 10000),
      setTimeout(() => trackEvent('time_30s', baseData), 30000),
      setTimeout(() => trackEvent('time_60s', baseData), 60000),
    ];

    return () => {
      window.removeEventListener('scroll', onScroll);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const trackEvent = async (eventType: string, data: Record<string, any>) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          session_id: data.session_id || sessionId,
          visitor_id: data.visitor_id || visitorId,
          visitor_type: data.visitor_type || visitorType,
          page_version: data.page_version || PAGE_VERSION,
          utm_source: data.utm_source || utmSource,
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          ...data,
        }),
      });
    } catch (err) {
      console.error('Track error:', err);
    }
  };

  const handleUnitClick = (unitId: string, unitName: string) => {
    trackEvent('unit_click', {
      unit_id: unitId,
      unit_name: unitName,
      utm_source: utmSource,
      visitor_id: visitorId,
      visitor_type: visitorType,
    });
    setTimeout(() => {
      window.location.href = DALOCK_APP_URL;
    }, 100);
  };

  const handleReserveClick = () => {
    trackEvent('reserve_click', {
      utm_source: utmSource,
      visitor_id: visitorId,
      visitor_type: visitorType,
    });
    window.location.href = DALOCK_APP_URL;
  };

  const handleMapClick = () => {
    trackEvent('map_click', {
      utm_source: utmSource,
      visitor_id: visitorId,
      visitor_type: visitorType,
    });
    window.open(BRANCH_NAVER_URL, '_blank');
  };

  const scrollToUnits = () => {
    trackEvent('hero_cta_click', {
      utm_source: utmSource,
      visitor_id: visitorId,
      visitor_type: visitorType,
    });
    document.getElementById('units-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/exterior.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative px-6 pt-12 pb-14">
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full mb-5">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              이수역 7번 출구 도보 2분
            </div>
            <h1 className="text-4xl font-black text-white mb-3 leading-tight">
              집이 좁으세요?<br />
              다락에 맡기세요
            </h1>
            <p className="text-white/90 text-base mb-6 leading-relaxed">
              24시간 언제든 내 짐을 꺼낼 수 있는<br />
              이수·사당 지역 최대 규모 셀프스토리지
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={scrollToUnits}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl transition text-sm shadow-xl"
              >
                공실 확인하기 →
              </button>
              <button
                onClick={handleMapClick}
                className="px-4 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl text-sm hover:bg-white/20 transition"
              >
                📍 지도
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-4 text-white/80 text-xs">
              <div className="flex items-center">
                <span className="text-white font-bold mr-1">서울 최대</span> 셀프스토리지 브랜드
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="flex items-center">
                <span className="text-white font-bold mr-1">전국 100+</span> 지점
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-1">이럴 때 다락을 찾으세요</h2>
          <p className="text-sm text-gray-500 mb-6">
            다락 이용자들이 가장 많이 선택하는 이유
          </p>
          <div className="grid grid-cols-2 gap-3">
            {useCases.map((useCase, i) => (
              <div
                key={i}
                className="bg-orange-50 rounded-xl p-4 border border-orange-100"
              >
                <div className="text-2xl mb-2">{useCase.icon}</div>
                <div className="font-bold text-sm mb-1">{useCase.title}</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {useCase.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image — 1평 더 넓어졌어요 */}
      <section className="px-6 pb-10">
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/interior-wider.jpg"
              alt="방금 우리집이 1평 더 넓어졌어요"
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            방금 우리집이 1평 더 넓어졌어요
          </p>
        </div>
      </section>

      {/* Unit Selection */}
      <section id="units-section" className="px-6 py-10 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-1">어떤 크기가 필요하세요?</h2>
          <p className="text-sm text-gray-500 mb-6">
            이수·사당 지역 최대 규모 · 138개 유닛 · 5가지 사이즈
          </p>

          <div className="space-y-3">
            {unitTypes.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleUnitClick(unit.id, unit.name)}
                className="w-full bg-white border-2 border-gray-100 hover:border-primary active:border-primary rounded-xl p-4 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg p-1 flex items-center justify-center">
                    <img
                      src={unit.image}
                      alt={unit.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-base">{unit.name}</div>
                      <div className="bg-orange-50 text-primary font-bold text-[10px] rounded px-2 py-0.5">
                        {unit.size}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-0.5">
                      {unit.description}
                    </div>
                    <div className="text-xs text-gray-400">
                      {unit.detail}
                    </div>
                  </div>
                  <div className="text-primary text-lg group-hover:translate-x-1 transition font-bold flex-shrink-0">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            💡 다이나믹 프라이싱 · 실시간 가격은 앱에서 확인
          </p>
        </div>
      </section>

      {/* Interior image + Features */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
            <img
              src="/interior-units.jpg"
              alt="다락 이수사당점 내부"
              className="w-full h-auto"
            />
          </div>

          <h2 className="text-xl font-bold mb-5">왜 다락 이수사당점인가요?</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">🚇</div>
              <div>
                <div className="font-bold text-base">이수역 도보 2분</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  이수·사당 지역 최대 규모 · 138개 유닛 보유
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🕐</div>
              <div>
                <div className="font-bold text-base">24시간 무인 출입</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  새벽에도 내 짐을 바로 꺼낼 수 있어요
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🔒</div>
              <div>
                <div className="font-bold text-base">CCTV 24시간 보안</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  전관 실시간 녹화, 본인만 출입 가능
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🌡️</div>
              <div>
                <div className="font-bold text-base">온습도 자동 관리</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  곰팡이·변형 걱정 없는 쾌적한 환경
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🛒</div>
              <div>
                <div className="font-bold text-base">무료 핸드카트 제공</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  무거운 짐도 쉽게 옮길 수 있어요
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">📅</div>
              <div>
                <div className="font-bold text-base">1개월부터 계약 가능</div>
                <div className="text-sm text-gray-600 mt-0.5">
                  짧게 필요해도 부담 없이 이용
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart image */}
      <section className="px-6 pb-10">
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/interior-cart.jpg"
              alt="무료 핸드카트 제공"
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            무거운 짐도 편하게 · 무료 핸드카트 제공
          </p>
        </div>
      </section>

      {/* Location */}
      <section className="px-6 py-10 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">오시는 길</h2>
          <div className="bg-white rounded-xl p-5">
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">주소</div>
              <div className="font-bold">서울 동작구 동작대로23길 7</div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">대중교통</div>
              <div className="font-bold">이수역 7번 출구 도보 2분</div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">운영시간</div>
              <div className="font-bold">24시간 무인 운영</div>
            </div>
            <button
              onClick={handleMapClick}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 font-bold text-sm hover:bg-gray-50 transition"
            >
              📍 네이버 지도에서 보기
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-10 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-black mb-2">
            집이 좁다고<br />
            이사까지 갈 필요 없어요
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            월 1개만 써보세요. 공간이 달라져요.
          </p>
          <button
            onClick={handleReserveClick}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition text-base shadow-xl"
          >
            다락 앱에서 공실·가격 확인하기 →
          </button>
        </div>
      </section>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-2xl">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleReserveClick}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg"
          >
            📱 다락 앱에서 공실 확인하기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}
