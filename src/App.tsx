import { useState } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
// ── Coach pages (Category 1) ──────────────────────────────────────────────────
import OverviewTab from './pages/coach/OverviewTab'
import PlayersTab from './pages/coach/PlayersTab'
import TeamTab from './pages/coach/TeamTab'
import MatchesTab from './pages/coach/MatchesTab'
import CompareTab from './pages/coach/CompareTab'
import TrendsTab from './pages/coach/TrendsTab'
import MacroReviewTab from './pages/coach/MacroReviewTab'
import WhatIfTab from './pages/coach/WhatIfTab'

// ── Scout pages (Category 2) ──────────────────────────────────────────────────
import GenerateReportTab from './pages/scout/GenerateReportTab'
import CounterStrategyTab from './pages/scout/CounterStrategyTab'
import AskCoachTab from './pages/scout/AskCoachTab'
import ThreatsTab from './pages/scout/ThreatsTab'
import MapStatsTab from './pages/scout/MapStatsTab'
import ScoutHistoryTab from './pages/scout/HistoryTab'

// ── Draft pages (Category 3) ──────────────────────────────────────────────────
import DraftBoardTab from './pages/draft/DraftBoardTab'
import SimulateTab from './pages/draft/SimulateTab'
import MetaChampionsTab from './pages/draft/MetaChampionsTab'
import ChampionSearchTab from './pages/draft/ChampionSearchTab'
import DraftHistoryTab from './pages/draft/HistoryTab'

type Section = 'coach' | 'scout' | 'draft'
type GameType = 'Valorant' | 'lol'

const DEFAULT_TABS: Record<Section, string> = {
  coach: 'overview',
  scout: 'generate',
  draft: 'draft',
}

// ── Coach section ─────────────────────────────────────────────────────────────
function CoachSection({ activeTab }: { activeTab: string }) {
  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />
      case 'players': return <PlayersTab />
      case 'team': return <TeamTab />
      case 'matches': return <MatchesTab />
      case 'compare': return <CompareTab />
      case 'trends': return <TrendsTab />
      case 'macro': return <MacroReviewTab />
      case 'whatif': return <WhatIfTab />
      default: return <OverviewTab />
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {renderTab()}
    </main>
  )
}

// ── Scout section ─────────────────────────────────────────────────────────────
function ScoutSection({ activeTab, game }: { activeTab: string; game: GameType }) {
  const renderTab = () => {
    switch (activeTab) {
      case 'generate': return <GenerateReportTab game={game} />
      case 'counter': return <CounterStrategyTab game={game} />
      case 'coach': return <AskCoachTab game={game} />
      case 'threats': return <ThreatsTab game={game} />
      case 'maps': return <MapStatsTab game={game} />
      case 'history': return <ScoutHistoryTab />
      default: return <GenerateReportTab game={game} />
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {renderTab()}
    </main>
  )
}

// ── Draft section ─────────────────────────────────────────────────────────────
function DraftSection({ activeTab }: { activeTab: string }) {
  const renderTab = () => {
    switch (activeTab) {
      case 'draft': return <DraftBoardTab />
      case 'simulate': return <SimulateTab />
      case 'meta': return <MetaChampionsTab />
      case 'champions': return <ChampionSearchTab />
      case 'history': return <DraftHistoryTab />
      default: return <DraftBoardTab />
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {renderTab()}
    </main>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('coach')
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS['coach'])
  const [scoutGame, setScoutGame] = useState<GameType>('Valorant')

  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    setActiveTab(DEFAULT_TABS[section])
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        scoutGame={scoutGame}
        onScoutGameChange={setScoutGame}
      />
      <TabBar
        section={activeSection}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeSection === 'coach' && <CoachSection activeTab={activeTab} />}
      {activeSection === 'scout' && <ScoutSection activeTab={activeTab} game={scoutGame} />}
      {activeSection === 'draft' && <DraftSection activeTab={activeTab} />}
    </div>
  )
}
