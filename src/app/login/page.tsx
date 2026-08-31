'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  LogIn, 
  UserPlus, 
  Music2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User 
} from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Mensajes de estado
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // --- 1. Validaciones para Registro ---
    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Por favor, ingresa un nombre de usuario.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas ingresadas no coinciden.');
        return;
      }

      const res = register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo crear la cuenta.');
        return;
      }

      setSuccessMessage('¡Cuenta creada con éxito! Entrando a tu espacio...');
      setTimeout(() => router.push('/'), 1200);
      return;
    }

    // --- 2. Validaciones para Login ---
    if (mode === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales no válidas.');
        return;
      }

      setSuccessMessage('¡Bienvenido de vuelta! Entrando...');
      setTimeout(() => router.push('/'), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-10">
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
        
        {/* Cabecera del formulario */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-inner">
            <Music2 size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crea tu Cuenta'}
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs">
            {mode === 'login'
              ? 'Accede para sincronizar tus listas y canciones favoritas.'
              : 'Únete para guardar tu música, historial y personalizar tu perfil.'}
          </p>
        </div>

        {/* Pestañas para alternar entre Iniciar Sesión y Registro */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'login' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'register' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Alerta de Éxito */}
        {successMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: David, Meloman0..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm py-3 rounded-xl transition transform active:scale-[0.98] shadow-lg cursor-pointer pt-3"
          >
            {mode === 'login' ? (
              <>
                <LogIn size={18} />
                <span>Ingresar</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Registrarme</span>
              </>
            )}
          </button>
        </form>

        {/* Enlace para continuar sin cuenta */}
        <div className="pt-2 text-center border-t border-zinc-800/80">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition inline-flex items-center gap-1.5"
          >
            <span>Explorar sin cuenta como invitado</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}