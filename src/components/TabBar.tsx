import {
  LayoutDashboard, User, Users, FileText, GitCompare,
  TrendingUp, ClipboardList, HelpCircle,
  Swords, MessageSquare, Map, History,
  PlayCircle, Crown, Search
} from 'lucide-react'
import { ReactNode } from 'react'

type Section = 'coach' | 'scout' | 'draft'

interface Tab {
  id: string
  label: string
  icon: ReactNode
}

const TABS: Record<Section, Tab[]> = {
  coach: [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'players', label: 'Players', icon: <User size={16} /> },
    { id: 'team', label: 'Team', icon: <Users size={16} /> },
    { id: 'matches', label: 'Matches', icon: <FileText size={16} /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={16} /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp size={16} /> },
    { id: 'macro', label: 'Macro Review', icon: <ClipboardList size={16} /> },
    { id: 'whatif', label: 'What-If', icon: <HelpCircle size={16} /> },
  ],
  scout: [
    { id: 'generate', label: 'New Report', icon: <FileText size={16} /> },
    { id: 'counter', label: 'Counter Strategy', icon: <Swords size={16} /> },
    { id: 'coach', label: 'Ask Coach', icon: <MessageSquare size={16} /> },
    { id: 'threats', label: 'Threat Analysis', icon: <Users size={16} /> },
    { id: 'maps', label: 'Map Stats', icon: <Map size={16} /> },
    { id: 'history', label: 'History', icon: <History size={16} /> },
  ],
  draft: [
    { id: 'draft', label: 'Draft Board', icon: <Swords size={16} /> },
    { id: 'simulate', label: 'Simulate', icon: <PlayCircle size={16} /> },
    { id: 'meta', label: 'Meta Champions', icon: <Crown size={16} /> },
    { id: 'champions', label: 'Champion Search', icon: <Search size={16} /> },
    { id: 'history', label: 'Draft History', icon: <History size={16} /> },
  ],
}

interface TabBarProps {
  section: Section
  activeTab: string
  onTabChange: (tab: string) => void
  disabled?: boolean
}

export default function TabBar({ section, activeTab, onTabChange, disabled = false }: TabBarProps) {
  const tabs = TABS[section]
  return (
    <div className={`bg-white border-b border-slate-200 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-1 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={disabled}
              onClick={() => !disabled && onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-c9-blue text-c9-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } ${disabled ? 'cursor-not-allowed' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
