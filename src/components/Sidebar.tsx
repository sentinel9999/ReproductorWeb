'use client';

import { useState, useRef } from 'react';
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
  Headphones,
  Menu, 
  X, 
  Search,
  LogIn,
  LogOut,
  Pin,
  PinOff
} from 'lucide-react';

const BASE_CATEGORIES = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Explorar', href: '/explore', icon: Compass },
  { name: 'Tu Biblioteca', href: '/library', icon: Library },
  { name: 'Álbumes', href: '/albums', icon: Music2 },
  { name: 'Radio', href: '/radio', icon: Radio },
  { name: 'Tendencias', href: '/trends', icon: Flame },
  { name: 'Subir Música', href: '/upload', icon: UploadCloud },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentUser, isAuthenticated, logout } = useAuthStore();

  // Modo DJ solo disponible para usuarios autenticados
  const categories = [
    ...BASE_CATEGORIES,
    ...(isAuthenticated ? [{ name: 'Modo DJ', href: '/dj', icon: Headphones }] : []),
  ];

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!isPinned) setIsOpen(false);
    }
  };

  const handleNavClick = () => {
    if (!isPinned || window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Sensor de proximidad para PC */}
      <div
        onMouseEnter={handleMouseEnter}
        className="fixed top-0 left-0 w-3 h-full z-40 hidden md:block"
        aria-hidden="true"
      />

      {/* Botón flotante limpio y minimalista (sin texto 'Menú') */}
      <button
        type="button"
        onMouseEnter={handleMouseEnter}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 shadow-2xl backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-90 ${
          isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
        }`}
        aria-label="Menú de navegación"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop oscuro en móvil */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-[calc(100vh-5rem)] bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 transition-transform duration-300 ease-out z-50 flex flex-col justify-between w-64 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex items-center justify-between p-5 border-b border-zinc-900">
            <Link 
              href="/" 
              onClick={handleNavClick}
              className="font-extrabold text-xl text-white tracking-wide flex items-center gap-2"
            >
              <span className="text-green-500">Rokola</span>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-normal">Web</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg transition hidden md:block cursor-pointer ${
                  isPinned 
                    ? 'text-green-400 bg-green-500/10 border border-green-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isPinned ? 'Desfijar menú' : 'Fijar menú abierto'}
              >
                {isPinned ? <Pin size={17} /> : <PinOff size={17} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition md:hidden cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Buscador */}
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

          {/* Categorías */}
          <nav className="flex-1 p-4 pt-2 space-y-1 overflow-y-auto scrollbar-none">
            <p className="text-[11px] font-bold text-zinc-500 uppercase px-3 mb-2 tracking-wider">
              Menú Principal
            </p>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = pathname === cat.href;

              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={handleNavClick}
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

        {/* Perfil del Usuario */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/60 flex-shrink-0">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/profile"
                onClick={handleNavClick}
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
                type="button"
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
              onClick={handleNavClick}
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