import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  // TODO: 인증 상태 확인 후 리다이렉트 로직 추가
  return <Dashboard />;
}
