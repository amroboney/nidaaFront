'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirm: string) => Promise<void>
  updateProfile: (data: { name?: string; email?: string; password?: string; password_confirmation?: string }) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(email, password)
          localStorage.setItem('auth_token', data.access_token)
          set({ token: data.access_token, user: data.user, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (name, email, password, confirm) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.register(name, email, password, confirm)
          localStorage.setItem('auth_token', data.access_token)
          set({ token: data.access_token, user: data.user, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      updateProfile: async (data) => {
        const { data: res } = await authApi.updateProfile(data)
        set({ user: res.data })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {}
        localStorage.removeItem('auth_token')
        set({ user: null, token: null })
      },

      fetchUser: async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        try {
          const { data } = await authApi.me()
          set({ user: data, token })
        } catch {
          localStorage.removeItem('auth_token')
          set({ user: null, token: null })
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
