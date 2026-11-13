"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { AuthDialog } from "./AuthDialog"

interface AuthContextValue {
  openAuth: (prompt?: string) => void
  closeAuth: () => void
}

const AuthContext = createContext<AuthContextValue>({
  openAuth: () => {},
  closeAuth: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({
  children,
  onAuthSuccess,
}: {
  children: ReactNode
  onAuthSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)

  const openAuth = (msg?: string) => {
    setPrompt(msg ?? null)
    setOpen(true)
  }

  const closeAuth = () => {
    setOpen(false)
  }

  return (
    <AuthContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        promptMessage={prompt}
        onSuccess={onAuthSuccess}
      />
    </AuthContext.Provider>
  )
}
