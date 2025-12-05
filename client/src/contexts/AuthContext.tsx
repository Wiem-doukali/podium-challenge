import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler une vérification de session
    const token = localStorage.getItem('token')
    if (token) {
      // Ici, normalement, on vérifierait le token avec l'API
      // Pour l'instant, on simule un utilisateur admin
      setTimeout(() => {
        setUser({
          id: '1',
          email: 'admin@miage.fr',
          name: 'Administrateur',
          role: 'ADMIN'
        })
        setLoading(false)
      }, 500)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Simulation de login
      if (email === 'admin@miage.fr' && password === 'Admin123!') {
        const userData = {
          id: '1',
          email,
          name: 'Administrateur',
          role: 'ADMIN' as const
        }
        
        localStorage.setItem('token', 'simulated-jwt-token')
        setUser(userData)
        toast.success('Connexion réussie')
      } else {
        throw new Error('Identifiants incorrects')
      }
    } catch (error) {
      toast.error('Échec de la connexion')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Déconnexion réussie')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}