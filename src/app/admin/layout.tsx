import { Shell } from '@/components/Shell';

export const metadata = { title: 'Panel · Carnicería Delicias' };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
