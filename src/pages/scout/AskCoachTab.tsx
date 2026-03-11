import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Send, User, Bot, Search, CheckCircle } from 'lucide-react'
import { scoutingApi, GameType } from '../../api/scouting'
import { useDebounce } from '../../hooks/useDebounce'

interface Props {
    game: GameType
}

interface Message {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
}

export default function AskCoachTab({ game }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: 'Hello! I\'m Coach C9. Select a team to analyze, or just ask me anything about the game!',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null)
    const [showResults, setShowResults] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Click outside to close search results
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchMutation = useMutation({
        mutationFn: () => scoutingApi.searchTeams(searchQuery, game),
    })

    useEffect(() => {
        if (debouncedSearchQuery.trim()) {
            searchMutation.mutate()
        }
    }, [debouncedSearchQuery])

    useEffect(() => {
        if (searchQuery) setShowResults(true)
    }, [searchQuery])

    // Get report context if team selected
    const reportQuery = useQuery({
        queryKey: ['report', selectedTeam?.id],
        queryFn: () => scoutingApi.generateReport(selectedTeam!.id, game, 5),
        enabled: !!selectedTeam
    })

    const chatMutation = useMutation({
        mutationFn: (msg: string) => scoutingApi.chatWithCoach(
            msg,
            reportQuery.data, // Pass full report as context
            selectedTeam?.id,
            game
        ),
        onSuccess: (data) => {
            const botMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                text: data.response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
        },
        onError: () => {
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                text: 'Sorry, I had trouble connecting to the strategy room. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        }
    })

    const handleSelectTeam = (team: any) => {
        setSelectedTeam({ id: team.team_id, name: team.team_name })
        setSearchQuery('')
        setShowResults(false)
        // Add system message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            text: `I've pulled up the data for ${team.team_name}. What would you like to know?`,
            timestamp: new Date()
        }])
    }

    const handleSend = () => {
        if (!input.trim() || chatMutation.isPending) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg])
        chatMutation.mutate(input)
        setInput('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] animate-fade-in relative gap-4">
            {/* Context Bar */}
            <div className="flex-shrink-0 card p-4 flex items-center gap-4 z-20" ref={searchRef}>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search team for context (optional)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchQuery) setShowResults(true) }}
                        className="input w-full pl-10"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                    {/* Fixed Results Dropdown */}
                    {showResults && searchMutation.data?.results && searchMutation.data.results.length > 0 && (
                        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {searchMutation.data.results.map((team: any) => (
                                <button
                                    key={team.team_id}
                                    onClick={() => handleSelectTeam(team)}
                                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedTeam?.id === team.team_id ? 'bg-c9-accent' : ''
                                        }`}
                                >
                                    <span className="font-medium text-slate-800">{team.team_name}</span>
                                    {selectedTeam?.id === team.team_id && <CheckCircle size={16} className="text-c9-blue" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedTeam && (
                    <div className="flex items-center gap-2 bg-c9-accent px-3 py-1.5 rounded-full border border-c9-blue/20">
                        <span className="text-sm font-semibold text-c9-blue">{selectedTeam.name}</span>
                        <button
                            onClick={() => setSelectedTeam(null)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 card overflow-hidden flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-c9-blue text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-c9-blue text-white rounded-tr-none'
                                    : 'bg-white border border-slate-200 shadow-sm rounded-tl-none text-slate-700'
                                }`}>
                                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {chatMutation.isPending && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Coach C9..."
                            className="input w-full pr-12 min-h-[50px] max-h-[150px] py-3 resize-none"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || chatMutation.isPending}
                            className="absolute right-2 top-2 p-2 text-c9-blue hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
