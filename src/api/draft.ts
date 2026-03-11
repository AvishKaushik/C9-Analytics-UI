import axios from 'axios'

// const API_BASE = 'https://c9-draft-api.onrender.com/api/v1'
const API_BASE = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export interface Champion {
  name: string
  roles: string[]
  tier?: string
  win_rate?: number
  pick_rate?: number
  synergies?: string[]
  counters?: string[]
  countered_by?: string[]
}

export interface DraftState {
  session_id: string
  our_team_id: string
  opponent_team_id: string
  our_side: 'blue' | 'red'
  current_phase: string
  our_bans: string[]
  their_bans: string[]
  our_picks: string[]
  their_picks: string[]
  recommendations: Array<{
    champion: string
    action: string
    reason: string
    score: number
  }>
  win_probability?: number
}

export interface CompositionAnalysis {
  champions: string[]
  composition_type: string
  win_condition: string
  power_spikes: string[]
  weaknesses: string[]
  synergy_score: number
}

export const draftApi = {
  // Search LoL teams
  searchTeams: async (search?: string, limit: number = 20) => {
    const res = await api.get('/draft/teams/lol', { params: { search, limit } })
    return res.data
  },

  // Start draft session
  startDraft: async (ourTeamId: string, opponentTeamId: string, ourSide: 'blue' | 'red') => {
    const res = await api.post('/draft/start', {
      our_team_id: ourTeamId,
      opponent_team_id: opponentTeamId,
      our_side: ourSide,
    })
    return res.data
  },

  // Update draft with pick/ban
  updateDraft: async (sessionId: string, champion: string, action: 'pick' | 'ban', team: 'blue' | 'red') => {
    const res = await api.post('/draft/update', {
      session_id: sessionId,
      champion_name: champion,
      action,
      team,
    })
    return res.data
  },

  // Get draft state
  getDraftState: async (sessionId: string) => {
    const res = await api.get(`/draft/${sessionId}/state`)
    return res.data
  },

  // Simulate complete draft
  simulateDraft: async (ourTeamId: string, opponentTeamId: string, ourSide: 'blue' | 'red') => {
    const res = await api.post('/draft/simulate', {
      our_team_id: ourTeamId,
      opponent_team_id: opponentTeamId,
      our_side: ourSide,
      auto_opponent: true,
    })
    return res.data
  },

  // Get draft history
  getDraftHistory: async (teamId: string, limit: number = 20) => {
    const res = await api.get(`/draft/history/${teamId}`, { params: { limit } })
    return res.data
  },

  // Search champions
  searchChampions: async (name: string, sessionId?: string) => {
    const res = await api.get('/draft/champions/search', { params: { name, session_id: sessionId } })
    return res.data
  },

  // Analyze composition
  analyzeComposition: async (champions: string[]) => {
    const res = await api.post('/draft/composition/analyze', { champions })
    return res.data
  },

  // Get meta champions
  getMetaChampions: async () => {
    const res = await api.get('/recommendations/meta')
    return res.data
  },

  // Get synergy recommendations
  getSynergyRecommendations: async (champions: string[]) => {
    const res = await api.post('/recommendations/synergy', { champions })
    return res.data
  },

  // Get counter recommendations
  getCounterRecommendations: async (enemyChampions: string[]) => {
    const res = await api.post('/recommendations/counter', { enemy_champions: enemyChampions })
    return res.data
  },

  // Get flex picks
  getFlexPicks: async () => {
    const res = await api.get('/recommendations/flex-picks')
    return res.data
  },

  // Get champion details
  getChampionDetails: async (name: string) => {
    const res = await api.get(`/recommendations/champion/${name}`)
    return res.data
  },

  // Compare drafts
  compareDrafts: async (blueTeam: string[], redTeam: string[]) => {
    const res = await api.post('/recommendations/compare-drafts', {
      blue_team: blueTeam,
      red_team: redTeam,
    })
    return res.data
  },

  // Predict opponent
  predictOpponent: async (sessionId: string) => {
    const res = await api.post('/draft/predict-opponent', { session_id: sessionId })
    return res.data
  },
}
