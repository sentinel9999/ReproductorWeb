import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Simulación de contraseña almacenada
  avatarUrl: string;
  likedSongIds: string[];
  createdAt: string;
}

interface AuthState {
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: { name: string; avatarUrl: string }) => void;
  toggleLikeSong: (trackId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      registeredUsers: [],
      isAuthenticated: false,

      // 1. Crear nuevo usuario con validación de duplicados
      register: (name, email, password) => {
        const { registeredUsers } = get();
        const normalizedEmail = email.trim().toLowerCase();

        // Validar si el correo ya existe
        const userExists = registeredUsers.some((u) => u.email === normalizedEmail);
        if (userExists) {
          return { success: false, error: 'Este correo electrónico ya está registrado.' };
        }

        // Crear la cuenta
        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: password, // Almacenado localmente
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
          likedSongIds: [],
          createdAt: new Date().toISOString(),
        };

        set({
          registeredUsers: [...registeredUsers, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        });

        return { success: true };
      },

      // 2. Validar credenciales (Login)
      login: (email, password) => {
        const { registeredUsers } = get();
        const normalizedEmail = email.trim().toLowerCase();

        const user = registeredUsers.find((u) => u.email === normalizedEmail);

        if (!user) {
          return { success: false, error: 'No existe una cuenta registrada con este correo.' };
        }

        if (user.passwordHash !== password) {
          return { success: false, error: 'La contraseña ingresada es incorrecta.' };
        }

        set({
          currentUser: user,
          isAuthenticated: true,
        });

        return { success: true };
      },

      // 3. Cerrar sesión
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      // 4. Actualizar datos del usuario actual
      updateProfile: ({ name, avatarUrl }) => {
        const { currentUser, registeredUsers } = get();
        if (!currentUser) return;

        const updatedUser = {
          ...currentUser,
          name: name.trim() || currentUser.name,
          avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
        };

        const updatedList = registeredUsers.map((u) =>
          u.id === currentUser.id ? updatedUser : u
        );

        set({
          currentUser: updatedUser,
          registeredUsers: updatedList,
        });
      },

      // 5. Alternar Me Gusta
      toggleLikeSong: (trackId) => {
        const { currentUser, registeredUsers } = get();
        if (!currentUser) return;

        const exists = currentUser.likedSongIds.includes(trackId);
        const updatedLikes = exists
          ? currentUser.likedSongIds.filter((id) => id !== trackId)
          : [...currentUser.likedSongIds, trackId];

        const updatedUser = { ...currentUser, likedSongIds: updatedLikes };
        const updatedList = registeredUsers.map((u) =>
          u.id === currentUser.id ? updatedUser : u
        );

        set({
          currentUser: updatedUser,
          registeredUsers: updatedList,
        });
      },
    }),
    {
      name: 'rokola-auth-storage',
    }
  )
);