import { AuthModalProvider } from '@/components/AuthModal';
import { Header } from '@/components/Header';

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider>
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header />
        <main id="contenido" className="flex-1">{children}</main>
        <footer className="border-t bg-white py-6 text-center text-xs text-neutral-600">
          Carnicería Delicias · Andahuaylas, Apurímac · Proyecto de Sistemas de Información, UNAJMA
        </footer>
      </div>
    </AuthModalProvider>
  );
}
