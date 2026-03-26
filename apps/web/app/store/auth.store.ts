import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  bio?: string
  skills: string[]
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  token: string | null
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  setHasHydrated: (val: boolean) => void
}

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: null,
//       _hasHydrated: false,
//       setAuth: (user, token) => {
//         localStorage.setItem("token", token)
//         set({ user, token })
//       },
//       clearAuth: () => {
//         localStorage.removeItem("token")
//         set({ user: null, token: null })
//       },
//       isAuthenticated: () => !!get().token,
//       setHasHydrated: (val) => set({ _hasHydrated: val }),
//     }),
//     {
//       name: "nexcore-auth",
//       onRehydrateStorage: () => (state) => {
//         state?.setHasHydrated(true)
//       },
//     }
//   )
// )


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        localStorage.setItem("token", token)
        set({ user, token })
      },
      clearAuth: () => {
        localStorage.removeItem("token")
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: "nexcore-auth",
      partialize: (state) => ({         // ← only persist these fields
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)