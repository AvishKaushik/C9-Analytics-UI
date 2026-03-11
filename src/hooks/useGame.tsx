import { createContext, useContext, useState, ReactNode } from 'react'

export type GameType = 'Valorant' | 'lol'

interface GameContextValue {
  game: GameType
  setGame: (game: GameType) => void
  teamId: string
}

const TEAM_IDS: Record<GameType, string> = {
  Valorant: '79',
  lol: '47351',
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameType>('Valorant')
  const teamId = TEAM_IDS[game]

  return (
    <GameContext.Provider value={{ game, setGame, teamId }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
