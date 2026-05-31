import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,

      login: (token, role, userId) => {
        localStorage.setItem('access_token', token)
        set({ token, role, user: { id: userId, role } })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, role: null })
      },

      setUser: (user) => set({ user }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, role: state.role, user: state.user }),
    }
  )
)
