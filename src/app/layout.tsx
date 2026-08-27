import './globals.css';
import AudioEngine from '@/components/AudioEngine';
import PlayerBar from '@/components/PlayerBar';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Rokola Web Player',
  description: 'Reproductor de música online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <div className="flex min-h-screen pb-24">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pl-0 md:pl-64 transition-all">
            {children}
          </main>
        </div>
        <AudioEngine />
        <PlayerBar />
      </body>
    </html>
  );
}