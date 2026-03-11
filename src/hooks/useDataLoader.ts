import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useRef } from 'react'
import { preloadTeamData, GameType } from '../api/insights'

const TEAM_IDS: Record<GameType, string> = {
  Valorant: '79',
  lol: '47351',
}

interface DataLoaderResult {
  isLoading: boolean
  isReady: boolean
  error: Error | null
}

export function useDataLoader(game: GameType): DataLoaderResult {
  const teamId = TEAM_IDS[game]
  const queryClient = useQueryClient()
  const [isReady, setIsReady] = useState(false)
  const [currentGame, setCurrentGame] = useState<GameType>(game)
  const processingRef = useRef(false)

  // Single batch query that fetches all data
  const { data, isSuccess, isLoading, error } = useQuery({
    queryKey: ['preload', teamId, game],
    queryFn: async () => {
      console.log('[DataLoader] Fetching batch data for', game)
      const result = await preloadTeamData(teamId, game, 20)
      console.log('[DataLoader] Batch response:', result.data)
      return result
    },
    staleTime: 5 * 60 * 1000,
  })

  // Populate individual caches when batch data arrives
  useEffect(() => {
    if (isSuccess && data?.data && !processingRef.current) {
      processingRef.current = true
      const { roster, matches, player_insights, player_trends } = data.data

      console.log('[DataLoader] Processing batch data:', {
        hasRoster: !!roster,
        playersCount: roster?.players?.length,
        hasMatches: !!matches,
        insightsCount: Object.keys(player_insights || {}).length,
        trendsCount: Object.keys(player_trends || {}).length,
      })

      // Check if we actually have meaningful data
      const hasPlayers = roster?.players?.length > 0
      const hasInsights = Object.keys(player_insights || {}).length > 0

      if (!hasPlayers) {
        console.warn('[DataLoader] No players in roster, data may be incomplete')
        processingRef.current = false
        return
      }

      // Cache roster
      if (roster) {
        queryClient.setQueryData(['roster', teamId, game], { data: roster })
      }

      // Cache matches
      if (matches) {
        queryClient.setQueryData(['matches', teamId, game], { data: matches })
      }

      // Cache player insights - match the format expected by PlayersTab
      if (player_insights) {
        Object.entries(player_insights).forEach(([playerId, insights]) => {
          queryClient.setQueryData(['playerInsights', playerId, game], { data: insights })
        })
      }

      // Cache player trends - match the format expected by TrendsTab
      if (player_trends) {
        Object.entries(player_trends).forEach(([playerId, trends]) => {
          queryClient.setQueryData(['playerTrends', playerId, game, 50], { data: trends })
        })
      }

      // Cache team insights (full data from preload)
      const team_insights = data.data.team_insights
      if (team_insights) {
        queryClient.setQueryData(['teamInsights', teamId, game, 30], {
          data: team_insights
        })
      } else if (roster?.team_stats) {
        // Fallback to basic team stats
        queryClient.setQueryData(['teamInsights', teamId, game, 30], {
          data: {
            team_stats: roster.team_stats,
            team_name: roster.team_name,
          }
        })
      }

      // Cache comparison data
      const playerIds = roster?.players?.map((p: any) => p.player_id) || []
      if (playerIds.length >= 2 && hasInsights) {
        const comparisonPlayers = Object.values(player_insights).map((p: any) => ({
          ...p,
          ...p.stats,
          // recent_form needs to be a string, not an object
          recent_form: typeof p.recent_form === 'object' ? p.recent_form?.form_rating : p.recent_form,
        }))
        queryClient.setQueryData(['comparison', playerIds, game], {
          data: {
            players: comparisonPlayers,
            comparison_highlights: [],
          }
        })
      }

      console.log('[DataLoader] Batch data loaded and cached successfully')
      setIsReady(true)
      processingRef.current = false
    }
  }, [isSuccess, data, queryClient, teamId, game])

  // Reset state when game changes
  useEffect(() => {
    if (game !== currentGame) {
      console.log('[DataLoader] Game changed from', currentGame, 'to', game)
      setIsReady(false)
      setCurrentGame(game)
      processingRef.current = false
    }
  }, [game, currentGame])

  return {
    isLoading: isLoading || (isSuccess && !isReady),
    isReady,
    error: error as Error | null,
  }
}
