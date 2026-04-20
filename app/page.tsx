'use client';

import { useState, useEffect, Suspense } from 'react';

const DALOCK_APP_URL = 'https://dalock.kr/branch/isu-sadang';
const BRANCH_NAVER_URL = 'https://naver.me/xnrINaXG';

const unitTypes = [
  {
    id: 'small',
    name: '스몰',
    size: '0.25평',
    description: '캐리어 2개 + 박스 5개',
    detail: '계절 옷, 서류, 취미용품',
  },
  {
    id: 'cube',
    name: '큐브',
    size: '0.5평',
    description: '캐리어 3~4개 + 박스 여러 개',
    detail: '여행 짐, 계절 옷 전부, 소형 가전',
  },
  {
    id: 'medium',
    name: '미디움',
    size: '1평',
    description: '원룸 짐 (가전 제외)',
    detail: '이사·결혼·유학 준비할 때',
  },
  {
    id: 'slim',
    name: '슬림',
    size: '1.5평',
    description: '1.5룸 짐 + 가전·가구',
    detail: '장기 보관이나 사업자 재고',
  },
  {
    id: 'large',
    name: '라지',
    size: '2평 이상',
    description: '투룸 이상 짐 전체',
    detail: '넉넉한 공간이 필요할 때',
  },
];

const useCases = [
  { icon: '📦', title: '이사 중', text: '새 집 들어가기 전 임시 보관' },
  { icon: '👗', title: '집이 좁아서', text: '계절 옷·비시즌 용품 보관' },
  { icon: '💍', title: '결혼·유학 준비', text: '잠깐 짐 둘 곳이 필요할 때' },
  { icon: '📦', title: '소규모 사업자', text: '재고·물품 보관 창고' },
];

function HomeContent() {
  const [sessionId, setSessionId] = useState('');
  const [utmSource, setUtmSource] = useState('');

  useEffect(() => {
    const id = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    setSessionId(id);

    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || 'direct';
    setUtmSource(source);

    trackEvent('page_view', { session_id: id, utm_source: source });

    // Scroll depth tracking
    const tracked = { 25: false, 50: false, 75: false, 100: false };
    const onScroll = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      );
      [25, 50, 75, 100].forEach((threshold) => {
        if (scrollPercent >= threshold && !tracked[threshold as keyof typeof tracked]) {
          tracked[threshold as keyof typeof tracked] = true;
          trackEvent('scroll_depth', { depth: threshold, session_id: id, utm_source: source });
        }
      });
    };
    window.addEventListener('scroll', onScroll);

    // Time on page
    const timeouts = [
      setTimeout(() => trackEvent('time_10s', { session_id: id, utm_source: source }), 10000),
      setTimeout(() => trackEvent('time_30s', { session_id: id, utm_source: source }), 30000),
      setTimeout(() => trackEvent('time_60s', { session_id: id, utm_source: source }), 60000),
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
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          utm_source: data.utm_source || utmSource,
          ...data,
        }),
      });
    } catch (err) {
      console.error('Track error:', err);
    }
  };

  const handleUnitClick = (unitId: string, unitName: string) => {
    trackEvent('unit_click', { unit_id: unitId, unit_name: unitName, utm_source: utmSource });
    setTimeout(() => {
      window.location.href = DALOCK_APP_URL;
    }, 100);
  };

  const handleReserveClick = () => {
    trackEvent('reserve_click', { utm_source: utmSource });
    window.location.href = DALOCK_APP_URL;
  };

  const handleMapClick = () => {
    trackEvent('map_click', { utm_source: utmSource });
    window.open(BRANCH_NAVER_URL, '_blank');
  };

  const scrollToUnits = () => {
    document.getElementById('units-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero Section with exterior image background */}
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
              이수역 유일 셀프스토리지
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
                <span className="text-white font-bold mr-1">60+</span> 현재 이용자
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="flex items-center">
                <span className="text-white font-bold mr-1">전국 100+</span> 지점
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="flex items-center">
                <span className="text-white font-bold mr-1">24시간</span> 운영
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases — 이럴 때 추천 */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-1">이럴 때 다락을 찾으세요</h2>
          <p className="text-sm text-gray-500 mb-6">
            이미 60명이 다락 이수사당점을 이용 중이에요
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
            클릭하면 다락 앱에서 공실·가격 확인 가능
          </p>

          <div className="space-y-2.5">
            {unitTypes.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleUnitClick(unit.id, unit.name)}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-100 hover:border-primary active:border-primary rounded-xl p-4 transition group"
              >
                <div className="flex items-center flex-1">
                  <div className="bg-orange-50 text-primary font-bold text-xs rounded-lg px-2.5 py-1.5 mr-3 min-w-[60px] text-center">
                    {unit.size}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-base">{unit.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {unit.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {unit.detail}
                    </div>
                  </div>
                </div>
                <div className="text-primary text-lg group-hover:translate-x-1 transition font-bold">
                  →
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
                  이수역 반경 500m 내 유일한 셀프스토리지
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

      {/* Cart image + convenience */}
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

      {/* Social Proof */}
      <section className="px-6 py-10 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-5">이용자들이 말해요</h2>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="text-yellow-400 text-sm">★★★★★</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "이사하는 동안 짐 보관할 곳이 필요했는데 이수역 가까워서 너무 편했어요. 24시간 출입 가능한 게 진짜 좋아요."
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="text-yellow-400 text-sm">★★★★★</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "원룸 살면서 계절 옷이 너무 짐이었는데, 지금은 겨울옷 다 여기 넣어놨어요. 집이 진짜 넓어진 느낌."
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="text-yellow-400 text-sm">★★★★★</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "앱으로 계약하고 출입까지 다 되니까 편해요. 관리자 안 만나도 되는 게 좋음."
              </p>
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

      {/* Final CTA Section */}
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
