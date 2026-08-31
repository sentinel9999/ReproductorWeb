'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Home, 
  Compass, 
  Library, 
  Music2, 
  Radio, 
  Flame, 
  UploadCloud,
  Menu, 
  X,
  Search,
  LogIn,
  LogOut
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Explorar', href: '/explore', icon: Compass },
  { name: 'Tu Biblioteca', href: '/library', icon: Library },
  { name: 'Álbumes', href: '/albums', icon: Music2 },
  { name: 'Radio', href: '/radio', icon: Radio },
  { name: 'Tendencias', href: '/trends', icon: Flame },
  { name: 'Subir Música', href: '/upload', icon: UploadCloud },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Usamos currentUser correctamente según el store de Zustand
  const { currentUser, isAuthenticated, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Botón flotante para reabrir menú en móviles o cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white cursor-pointer shadow-lg transition hover:scale-105"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Contenedor Lateral */}
      <aside
        className={`fixed top-0 left-0 h-[calc(100vh-5rem)] bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 z-30 flex flex-col justify-between ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'
        }`}
      >
        {/* Parte Superior: Logo, Buscador y Categorías */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* 1. Cabecera */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-900">
            <Link href="/" className="font-extrabold text-xl text-white tracking-wide flex items-center gap-2">
              <span className="text-green-500">Rokola</span>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-normal">Web</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition md:hidden"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          {/* 2. Buscador Integrado */}
          <div className="p-4 pb-2">
            <form onSubmit={handleSearch} className="relative">
              <Search 
                size={15} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar música, artistas..."
                className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2 border border-zinc-800 focus:border-green-500 focus:outline-none transition shadow-inner"
              />
            </form>
          </div>

          {/* 3. Navegación */}
          <nav className="flex-1 p-4 pt-2 space-y-1 overflow-y-auto scrollbar-none">
            <p className="text-[11px] font-bold text-zinc-500 uppercase px-3 mb-2 tracking-wider">
              Menú Principal
            </p>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = pathname === cat.href;

              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition font-medium cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-green-400' : 'text-zinc-400'} />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Parte Inferior: Perfil del Usuario Activo */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/60 flex-shrink-0">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/profile"
                className={`flex items-center gap-2.5 min-w-0 flex-1 p-1.5 rounded-xl transition hover:bg-zinc-900 group cursor-pointer ${
                  pathname === '/profile' ? 'bg-zinc-900/80 ring-1 ring-zinc-700' : ''
                }`}
                title="Ir a mi perfil"
              >
                <img
                  src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-800 object-cover flex-shrink-0 group-hover:border-green-500 transition"
                  onError={(e) => {
                    e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=UserFallback';
                  }}
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-green-400 transition">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">Ver perfil</p>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition cursor-pointer flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium py-2.5 rounded-lg transition shadow-sm cursor-pointer"
            >
              <LogIn size={15} />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}