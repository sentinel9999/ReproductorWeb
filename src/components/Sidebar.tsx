'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Compass, 
  Library, 
  Music2, 
  Radio, 
  Flame, 
  Menu, 
  X,
  Search
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Explorar', href: '/explore', icon: Compass },
  { name: 'Tu Biblioteca', href: '/library', icon: Library },
  { name: 'Álbumes', href: '/albums', icon: Music2 },
  { name: 'Radio', href: '/radio', icon: Radio },
  { name: 'Tendencias', href: '/trending', icon: Flame },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir cuando está oculto */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Menú Lateral */}
      <aside
        className={`fixed top-0 left-0 h-[calc(100vh-5rem)] bg-zinc-950 border-r border-zinc-800 transition-all duration-300 z-30 flex flex-col ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'
        }`}
      >
        {/* Cabecera del menú */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900">
          <span className="font-bold text-lg text-white tracking-wide">Rokola</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sección de Búsqueda Integrada */}
        <div className="p-4 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar música, artistas..."
              className="w-full bg-zinc-900/90 text-xs text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 border border-zinc-800 focus:border-green-500 focus:outline-none transition"
            />
          </form>
        </div>

        {/* Lista de Categorías */}
        <nav className="flex-1 p-4 pt-2 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-zinc-500 uppercase px-3 mb-2 tracking-wider">
            Categorías
          </p>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition font-medium"
              >
                <Icon size={18} />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}