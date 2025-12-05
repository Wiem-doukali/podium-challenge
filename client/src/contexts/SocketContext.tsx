import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface SocketContextType {
  isConnected: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaderboard: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateLeaderboard: (data: any[]) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket doit être utilisé dans SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isConnected, setIsConnected] = useState(true) // Simulé pour l'instant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaderboard, setLeaderboard] = useState<any[]>([
    {
      id: '1',
      name: 'Les Codeurs Masqués',
      score: 450,
      members: ['Alice Dupont', 'Bob Martin', 'Charlie Wilson'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Codeurs'
    },
    {
      id: '2',
      name: 'FullStack Warriors',
      score: 380,
      members: ['David Lee', 'Emma Garcia', 'Frank Miller'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Warriors'
    },
    {
      id: '3',
      name: 'React Masters',
      score: 520,
      members: ['Grace Hopper', 'Henry Ford', 'Irene Joliot'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Masters'
    }
  ])

  // Simulation de mises à jour temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulation d'une mise à jour aléatoire
      if (Math.random() > 0.7 && leaderboard.length > 0) {
        const randomIndex = Math.floor(Math.random() * leaderboard.length)
        const updatedLeaderboard = [...leaderboard]
        updatedLeaderboard[randomIndex] = {
          ...updatedLeaderboard[randomIndex],
          score: updatedLeaderboard[randomIndex].score + Math.floor(Math.random() * 10)
        }
        updatedLeaderboard.sort((a, b) => b.score - a.score)
        setLeaderboard(updatedLeaderboard)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [leaderboard])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateLeaderboard = (data: any[]) => {
    setLeaderboard(data)
  }

  const value = {
    isConnected,
    leaderboard,
    updateLeaderboard
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}