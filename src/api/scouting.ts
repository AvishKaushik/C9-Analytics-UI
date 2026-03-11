import axios from 'axios'

const API_BASE = 'https://c9-analytics-api.onrender.com/api/v1'
// const API_BASE = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export type GameType = 'Valorant' | 'lol'

export interface ScoutingReport {
  report_id: string
  opponent_team_id: string
  opponent_name: string
  game: GameType
  generated_at: string
  executive_summary: string
  team_profile: {
    playstyle: string
    identity: string
    strengths: string[]
    weaknesses: string[]
  }
  player_profiles: Array<{
    player_id: string
    player_name: string
    threat_level: string
    primary_agents: string[]
    tendencies: string[]
    stats: Record<string, number>
  }>
  key_findings: string[]
  preparation_priorities: string[]
}

export interface CounterStrategy {
  opponent_team_id: string
  our_team_id: string
  win_conditions: string[]
  recommendations: Array<{
    priority: string
    category: string
    title: string
    description: string
    execution_steps: string[]
  }>
  key_matchups: Array<{
    our_player: string
    their_player: string
    advantage: string
    tips: string[]
  }>
}

export interface ThreatRanking {
  player_id: string
  player_name: string
  threat_level: string
  threat_score: number
  reasoning: string
  key_stats: Record<string, number>
}

export const scoutingApi = {
  // Search teams
  searchTeams: async (name: string, game: GameType) => {
    const res = await api.get('/report/teams/search', { params: { name, game } })
    return res.data
  },

  // Generate scouting report
  generateReport: async (opponentTeamId: string, game: GameType, numMatches: number = 10) => {
    const res = await api.post('/report/generate', {
      opponent_team_id: opponentTeamId,
      game,
      num_recent_matches: numMatches,
    })
    return res.data
  },

  // Get report by ID
  getReport: async (reportId: string) => {
    const res = await api.get(`/report/${reportId}`)
    return res.data
  },

  // Get report history
  getReportHistory: async (limit: number = 20) => {
    const res = await api.get('/report/reports/history', { params: { limit } })
    return res.data
  },

  // Generate counter strategy
  async getCounterStrategy(opponentTeamId: string, ourTeamId: string, game: GameType) {
    const response = await api.post<CounterStrategy>(`/report/counter-strategy`, {
      opponent_team_id: opponentTeamId,
      our_team_id: ourTeamId,
      game: game
    })
    return response.data
  },

  async chatWithCoach(message: string, contextData?: any, teamId?: string, game?: GameType) {
    const response = await api.post<{ response: string }>(`/coach/chat`, {
      message,
      context_data: contextData,
      team_id: teamId,
      game
    })
    return response.data
  },

  // Compare teams
  compareTeams: async (teamAId: string, teamBId: string, game: GameType, numMatches: number = 10) => {
    const res = await api.post('/report/compare', {
      team_a_id: teamAId,
      team_b_id: teamBId,
      game,
      num_matches: numMatches,
    })
    return res.data
  },

  // Get map stats (Valorant)
  getMapStats: async (teamId: string, limit: number = 10) => {
    const res = await api.get(`/report/maps/stats/${teamId}`, { params: { limit } })
    return res.data
  },

  // Get threat rankings
  getThreatRankings: async (teamId: string, game: GameType, limit: number = 10) => {
    const res = await api.get(`/report/threats/${teamId}`, { params: { game, limit } })
    return res.data
  },

  // Delete report
  deleteReport: async (reportId: string) => {
    const res = await api.delete(`/report/${reportId}`)
    return res.data
  },
}
