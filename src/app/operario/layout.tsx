import { Shell } from '@/components/Shell';

export const metadata = { title: 'Panel operativo · Carnicería Delicias' };
export default function OperarioLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
