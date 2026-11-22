import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Carnicería Delicias · Andahuaylas',
  description: 'Carnes de calidad, cortes de res y embutidos para tu hogar o negocio. Pedidos en línea en Andahuaylas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
