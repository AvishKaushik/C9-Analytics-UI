import { insightsApi } from './client'

export type GameType = 'lol' | 'Valorant'

// Player insights
export const getPlayerInsights = (playerId: string, game: GameType, limit = 10) =>
  insightsApi.post('/insights/player', { player_id: playerId, game, limit })

export const getPlayerProfile = (playerId: string, game: GameType, limit = 10) =>
  insightsApi.get(`/insights/player/${playerId}/profile`, { params: { game, limit } })

export const getPlayerTrends = (playerId: string, game: GameType, limit = 20) =>
  insightsApi.get(`/insights/trends/${playerId}`, { params: { game, limit } })

// Team insights
export const getTeamInsights = (teamId: string, game: GameType, limit = 10) =>
  insightsApi.post('/insights/team', { team_id: teamId, game, limit })

export const getTeamRoster = (teamId: string, game: GameType, limit = 10) =>
  insightsApi.get(`/insights/team/${teamId}/roster`, { params: { game, limit } })

// Matches
export const getTeamMatches = (teamId: string, game: GameType, limit = 20) =>
  insightsApi.get(`/insights/matches/${teamId}`, { params: { game, limit } })

export const getMatchTimeline = (matchId: string, game: GameType, gameNumber = 1) =>
  insightsApi.get(`/insights/match/${matchId}/timeline`, { params: { game, game_number: gameNumber } })

// Comparisons
export const comparePlayers = (playerIds: string[], game: GameType, limit = 10) =>
  insightsApi.post('/insights/compare/players', { player_ids: playerIds, game, limit })

export const compareTeams = (teamIds: string[], game: GameType, limit = 10) =>
  insightsApi.post('/insights/compare/teams', { team_ids: teamIds, game, limit })

// Macro review
export const getMacroReview = (matchId: string, game: GameType, gameNumber = 1) =>
  insightsApi.post('/macro-review', { match_id: matchId, game, game_number: gameNumber })

// What-if
export const analyzeWhatIf = (matchId: string, game: GameType, scenario: string) =>
  insightsApi.post('/what-if', { match_id: matchId, game, scenario_description: scenario })

// Batch preload - fetches all data in one request
export const preloadTeamData = (teamId: string, game: GameType, limit = 10) =>
  insightsApi.get(`/insights/preload/${teamId}`, { params: { game, limit } })
