import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '다락 이수사당점 - 셀프스토리지',
  description: '이수역 3번 출구 도보 5분, 24시간 출입 가능한 셀프스토리지',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
