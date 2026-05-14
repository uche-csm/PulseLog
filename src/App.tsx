/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  Calendar, 
  BarChart3, 
  BrainCircuit,
  Ticket,
  Clock,
  Sparkles,
  Search,
  Settings,
  Bell,
  CheckCircle2,
  MoreVertical,
  Layers,
  Activity,
  Heart,
  Menu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

import Markdown from 'react-markdown';
import { Account, Interaction, SentimentTone, AIAnalysis, CSM } from './types';
import { MOCK_ACCOUNTS, TEAM } from './mockData';
import { analyzeAccountSentiment, chatWithAdvisor } from './services/aiDirector';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(MOCK_ACCOUNTS[0].id);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Alerts' | 'Heatmap' | 'Integrations'>('Dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentNudge, setCurrentNudge] = useState<number | null>(0); 
  const [isExecutiveBriefing, setIsExecutiveBriefing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'At Risk' | 'Onboarding'>('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, searchTerm, statusFilter]);

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId) || accounts[0],
  [accounts, selectedAccountId]);

  const highRiskAccounts = useMemo(() => 
    accounts.filter(a => a.status === 'At Risk' || a.metrics.healthScore < 60),
  [accounts]);

  const activeCSM = TEAM[0]; // Uchechukwu Precious

  useEffect(() => {
    async function runAnalysis() {
      setIsLoadingAi(true);
      const analysis = await analyzeAccountSentiment(selectedAccount);
      setAiAnalysis(analysis);
      setIsLoadingAi(false);
    }
    if (selectedAccountId) runAnalysis();
  }, [selectedAccountId]);

  const handleAddInteraction = (interaction: Interaction) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccountId) {
        return {
          ...acc,
          interactions: [interaction, ...acc.interactions],
          metrics: {
            ...acc.metrics,
            lastTouch: interaction.date,
            nps: interaction.nps // simple update for demo
          }
        };
      }
      return acc;
    }));
    setIsLogModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#D81B60]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-300/20 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "bg-white border-r border-[#1A1A1A]/10 flex flex-col shrink-0 z-[60] transition-all duration-500 ease-in-out fixed md:relative h-full",
        isSidebarOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full md:translate-x-0 w-20 md:w-64"
      )}>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-6 right-6 p-2 text-stone-400">
           <Plus className="rotate-45" />
        </button>

        <div className="p-6 md:p-8 border-b border-[#1A1A1A]/5 flex flex-col items-center md:items-start shrink-0">
          <h1 className="text-2xl md:text-3xl font-display italic text-[#1A1A1A] leading-tight">Timber</h1>
          <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-[#D81B60]" />
          <p className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#D81B60] font-bold mt-2 opacity-60">CSM Intelligence</p>
        </div>
        
        <nav className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <NavButton 
              active={activeTab === 'Dashboard'} 
              onClick={() => setActiveTab('Dashboard')}
              icon={<Layers className="w-4 h-4" />}
              label="Portfolio"
            />
            <NavButton 
              active={activeTab === 'Alerts'} 
              onClick={() => setActiveTab('Alerts')}
              icon={<AlertCircle className="w-5 h-5" />}
              label="Red Alerts"
              badge={highRiskAccounts.length}
            />
            <NavButton 
              active={activeTab === 'Heatmap'} 
              onClick={() => setActiveTab('Heatmap')}
              icon={<Activity className="w-5 h-5" />}
              label="Health Matrix"
            />
            <NavButton 
              active={activeTab === 'Integrations'} 
              onClick={() => setActiveTab('Integrations')}
              icon={<Plus className="w-5 h-5" />}
              label="Integrations"
            />
          </div>

          <div className="pt-6 px-3 md:px-6">
            <div className="flex flex-col gap-3 mb-6">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl py-2 pl-9 pr-3 text-[10px] focus:outline-none focus:border-[#D81B60]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-2">
                  {(['All', 'Healthy', 'At Risk'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={cn(
                        "px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all",
                        statusFilter === f ? "bg-[#1A1A1A] text-white" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                      )}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>

            <div className="text-[11px] uppercase tracking-wider text-[#A84A5E] mb-3 px-2 font-bold font-georgia italic">Portfolio Signals</div>
            <div className="space-y-1">
              {filteredAccounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setActiveTab('Dashboard');
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group",
                    selectedAccountId === acc.id && activeTab === 'Dashboard'
                      ? "bg-white shadow-sm border border-stone-200 scale-[1.02]" 
                      : "hover:bg-white/40 opacity-70 hover:opacity-100"
                  )}
                >
                  <span className="font-medium text-[11px] text-stone-700 truncate mr-2">{acc.name}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    acc.status === 'Healthy' ? "bg-green-500" : "bg-rose-500"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#FADADD] bg-stone-50 mt-auto shrink-0">
          <div className="flex items-center gap-3 justify-start">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white hover:bg-[#D81B60] transition-colors"
            >
              UP
            </button>
            <div className="block">
              <p className="text-[10px] font-bold">U. Precious</p>
              <p className="text-[9px] text-[#A84A5E]">CSM</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="ml-auto text-stone-400 hover:text-[#D81B60] block">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {activeTab === 'Dashboard' && (
          <div className="flex flex-col h-full overflow-hidden">
            <Header 
              title={selectedAccount.name} 
              status={selectedAccount.status} 
              onLogClick={() => setIsLogModalOpen(true)}
              account={selectedAccount}
              isBriefing={isExecutiveBriefing}
              onBriefingToggle={() => setIsExecutiveBriefing(!isExecutiveBriefing)}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
              {isExecutiveBriefing ? (
                <ExecutiveBriefingView account={selectedAccount} />
              ) : (
                <DashboardView account={selectedAccount} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'Alerts' && (
           <div className="flex flex-col h-full overflow-hidden">
            <AlertsView highRiskAccounts={highRiskAccounts} onSelect={(id, briefing) => {
              setSelectedAccountId(id);
              setActiveTab('Dashboard');
              setIsExecutiveBriefing(briefing);
            }} />
          </div>
        )}

        {activeTab === 'Heatmap' && (
           <div className="flex flex-col h-full overflow-hidden">
            <HeatmapView accounts={accounts} />
          </div>
        )}

        {activeTab === 'Integrations' && (
           <div className="flex flex-col h-full overflow-hidden">
            <IntegrationsView />
          </div>
        )}
      </main>

      {/* AI Director Widget */}
      <AiWidget 
        analysis={aiAnalysis}
        isLoading={isLoadingAi}
        account={selectedAccount}
      />

      {/* Onboarding Nudges */}
      <AnimatePresence>
        {currentNudge !== null && (
          <NudgeManager step={currentNudge} onNext={() => setCurrentNudge(prev => (prev! < 3 ? prev! + 1 : null))} onSkip={() => setCurrentNudge(null)} />
        )}
      </AnimatePresence>

      {/* Interaction Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <InteractionModal 
            onClose={() => setIsLogModalOpen(false)}
            onSubmit={handleAddInteraction}
            csmId={activeCSM.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- View Sub-Components ---

function SettingsModal({ onClose, csm }: { onClose: () => void, csm: CSM }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-10 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display italic">Success Settings</h2>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mt-1">Configure your Command Center</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><Plus className="rotate-45" /></button>
        </div>

        <div className="p-10 space-y-10">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-[2rem] bg-[#1A1A1A] flex items-center justify-center text-white text-2xl font-display italic">UP</div>
             <div>
                <h4 className="text-xl font-bold">{csm.name}</h4>
                <p className="text-sm text-stone-500">{csm.role}</p>
                <button className="text-[10px] font-black uppercase text-[#D81B60] mt-2">Update Credentials</button>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold">Proactive Sentiment Monitoring</p>
                   <p className="text-[10px] text-stone-400">Run AI analysis on every new pulse signal</p>
                </div>
                <div className="w-10 h-5 bg-[#D81B60] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold">Health Threshold Alerts</p>
                   <p className="text-[10px] text-stone-400">Trigger Strategic Review for scores below 60%</p>
                </div>
                <div className="w-10 h-5 bg-[#D81B60] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
             </div>
          </div>
        </div>

        <div className="p-10 bg-stone-50 border-t border-stone-100 flex gap-4">
          <button onClick={onClose} className="flex-1 prestige-btn">Save Preferences</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardView({ account }: { account: Account }) {
  return (
    <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto">
      <div className="glass-card p-6 md:p-10 bg-white/60">
        <h2 className="text-2xl md:text-4xl font-display italic mb-4">{account.name} Overview</h2>
        <p className="text-xs md:text-sm text-stone-600 leading-relaxed italic max-w-3xl">
          "{account.description}"
        </p>
      </div>

      {/* Executive Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Expansion Pipeline" 
          value={`$${(account.metrics.expansionPipeline / 1000).toFixed(0)}k`} 
          icon={<TrendingUp className="w-4 h-4" />}
          subtext="Net New ARR Potential"
          color="green"
        />
        <MetricCard 
          label="Multi-threading" 
          value={`${account.metrics.multiThreadingScore}/10`} 
          icon={<Users className="w-4 h-4" />}
          subtext="Active Stakeholders"
          progress={account.metrics.multiThreadingScore * 10}
        />
        <MetricCard 
          label="Days to Renewal" 
          value={account.metrics.daysToRenewal.toString()} 
          icon={<Calendar className="w-4 h-4" />}
          subtext={account.metrics.daysToRenewal < 60 ? "CRITICAL WINDOW" : "Stability Phase"}
          color={account.metrics.daysToRenewal < 60 ? 'rose' : 'green'}
        />
        <MetricCard 
          label="Strategic Alignment" 
          value={`${account.metrics.strategicAlignment}%`} 
          icon={<Heart className="w-4 h-4" />}
          subtext="Value Prop Resonancy"
          progress={account.metrics.strategicAlignment}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 opacity-60">
        <MetricCard 
          label="NPS Pulse" 
          value={account.metrics.nps.toFixed(1)} 
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <MetricCard 
          label="CSAT" 
          value={account.metrics.csat.toFixed(1)} 
          icon={<Sparkles className="w-4 h-4" />}
          color="green"
        />
        <MetricCard 
          label="Support High-Pri" 
          value={account.metrics.openHighPriorityTickets.toString()} 
          icon={<Ticket className="w-4 h-4" />}
        />
        <MetricCard 
          label="Product Adoption" 
          value={`${account.metrics.productUsageScore}%`} 
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 md:p-8 flex flex-col h-[400px] md:h-[500px] lg:col-span-3">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-[#D81B60]" />
            <h3 className="text-2xl font-display font-medium">Interaction Soul</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {account.interactions.length > 0 ? (
              account.interactions.map(interaction => (
                <div key={interaction.id} className="relative pl-6 pb-8 border-l-2 border-[#1A1A1A]/5 last:border-0 last:pb-0 group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#D81B60]" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">{format(new Date(interaction.date), 'MMM d, yyyy')}</span>
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{interaction.tone}</span>
                  </div>
                  <h4 className="text-xs font-bold mb-2 uppercase tracking-wide">{interaction.type}</h4>
                  <p className="text-[12px] text-stone-600 leading-relaxed italic">"{interaction.notes}"</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {interaction.tags.map(t => (
                      <span key={t} className="text-[9px] bg-white text-[#1A1A1A] px-2 py-1 rounded-full border border-[#1A1A1A]/10 font-bold uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-sm">Waiting for first signal...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutiveBriefingView({ account }: { account: Account }) {
  return (
    <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-0">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-display italic leading-tight">Executive Briefing: {account.name}</h2>
        <p className="text-[10px] md:text-[11px] text-stone-500 uppercase tracking-widest max-w-lg mx-auto">{account.description}</p>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#D81B60] font-black pt-2 md:pt-4">Confidential • {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="glass-card p-6 md:p-12 space-y-6 md:space-y-8">
          <h3 className="text-2xl md:text-3xl font-display italic border-b border-stone-200 pb-4">Core Performance</h3>
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <p className="text-[9px] md:text-[10px] uppercase font-bold text-stone-400 mb-1">Health</p>
              <p className="text-2xl md:text-4xl font-display text-[#1A1A1A]">{account.metrics.healthScore}%</p>
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] uppercase font-bold text-stone-400 mb-1">Depth</p>
              <p className="text-2xl md:text-4xl font-display text-[#1A1A1A]">{account.metrics.multiThreadingScore}/10</p>
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] uppercase font-bold text-stone-400 mb-1">Pipeline</p>
              <p className="text-2xl md:text-4xl font-display text-[#1A1A1A]">${(account.metrics.expansionPipeline / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] uppercase font-bold text-stone-400 mb-1">Renewal</p>
              <p className="text-2xl md:text-4xl font-display text-[#1A1A1A]">{account.metrics.strategicAlignment}%</p>
            </div>
          </div>
        </div>

        {/* AUTHORITATIVE EXECUTIVE SUMMARY - SOLID COLORED BACKGROUND FOR MAX VISIBILITY */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#D81B60] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden ring-8 ring-[#D81B60]/10 border-4 border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <Sparkles className="w-8 h-8 text-rose-200" />
            <h3 className="text-2xl md:text-3xl font-display italic text-white drop-shadow-sm">CSM Executive Narrative</h3>
            <div className="space-y-4">
              <p className="text-xl md:text-2xl font-display italic text-white leading-tight">
                "Maintaining positive momentum post-renewal. Strategic alignment on expansion is the primary growth blocker for Q2. Engaging stakeholders next week."
              </p>
            </div>
            <div className="pt-6 md:pt-8 flex items-center gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center font-bold text-[#D81B60] shadow-lg shrink-0">UP</div>
               <div className="min-w-0">
                  <p className="text-xs md:text-sm font-bold text-white truncate">Uchechukwu Precious</p>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-rose-200 font-bold truncate">Customer Success Manager</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsView({ highRiskAccounts, onSelect }: { highRiskAccounts: Account[], onSelect: (id: string, briefing: boolean) => void }) {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-display italic text-rose-700 flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-xl"><AlertCircle className="w-5 h-5 md:w-6 md:h-6" /></div>
          Red Alert Command
        </h2>
        <p className="text-xs md:text-sm text-stone-500 mt-2 max-w-xl">Critical accounts needing immediate intervention. Volume spikes, low NPS, or missed QBRs.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {highRiskAccounts.map(acc => (
            <motion.div 
              key={acc.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelect(acc.id, true)}
              className="bg-white border-2 border-rose-100 p-5 md:p-6 rounded-[2rem] md:rounded-3xl shadow-lg cursor-pointer hover:border-rose-400 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-rose-900">{acc.name}</h3>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">CSM: {TEAM.find(t => t.id === acc.csmId)?.name}</p>
                </div>
                <div className="text-rose-600 bg-rose-50 rounded-full w-10 h-10 flex items-center justify-center font-display text-lg font-bold">
                  {acc.metrics.nps}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <p className="text-[9px] uppercase font-black text-stone-400">Tickets</p>
                  <p className="text-lg font-display text-rose-700 font-bold">{acc.metrics.ticketVolume}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <p className="text-[9px] uppercase font-black text-stone-400">Health</p>
                  <p className="text-lg font-display text-rose-700 font-bold">{acc.metrics.healthScore}%</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 shrink-0">
                {acc.metrics.isQBRMissed && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase italic">
                    <Calendar className="w-3 h-3" /> QBR Missed Since {acc.metrics.lastQBRDate}
                  </div>
                )}
                {acc.metrics.openHighPriorityTickets > 0 && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase italic">
                    <AlertCircle className="w-3 h-3" /> {acc.metrics.openHighPriorityTickets} Critical Support Tickets
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(acc.id, true); }}
                className="mt-auto w-full py-3 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-colors shadow-md shadow-rose-100"
              >
                Enter Strategic Review
              </button>
            </motion.div>
          ))}
          {highRiskAccounts.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-emerald-600 bg-emerald-50 rounded-3xl border-2 border-dashed border-emerald-200">
               <CheckCircle2 className="w-12 h-12 mb-3" />
               <h4 className="text-xl font-display italic">Enterprise book is stable. Zero critical alerts.</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeatmapView({ accounts }: { accounts: Account[] }) {
  const metrics = ['NPS', 'CSAT', 'Usage', 'Tickets', 'Health'];
  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-hidden">
      <div className="mb-8 shrink-0">
        <h2 className="text-2xl md:text-3xl font-display italic text-[#D81B60]">Health Matrix</h2>
        <p className="text-xs md:text-sm text-stone-500 mt-2">Core metric benchmarking across the enterprise portfolio.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-[#FADADD] overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div className="min-w-[600px] md:min-w-0">
            <div className="grid grid-cols-6 border-b border-[#FADADD] bg-stone-50 shrink-0">
              <div className="p-4 text-[9px] md:text-[10px] uppercase font-black text-stone-500 tracking-wider">Account</div>
              {metrics.map(m => (
                <div key={m} className="p-4 text-[9px] md:text-[10px] uppercase font-black text-stone-500 tracking-wider text-center">{m}</div>
              ))}
            </div>
            {accounts.map(acc => (
              <div key={acc.id} className="grid grid-cols-6 border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <div className="p-4 font-bold text-[10px] md:text-xs truncate">{acc.name}</div>
                <HeatCell value={acc.metrics.nps} max={10} />
                <HeatCell value={acc.metrics.csat} max={5} />
                <HeatCell value={acc.metrics.productUsageScore} max={100} />
                <HeatCell value={acc.metrics.ticketVolume} max={30} inverse />
                <HeatCell value={acc.metrics.healthScore} max={100} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatCell({ value, max, inverse = false }: { value: number, max: number, inverse?: boolean }) {
  const ratio = value / max;
  const intensity = inverse ? 1 - ratio : ratio;
  
  let bgColor = "rgba(244, 63, 94, " + (1 - intensity) * 0.4 + ")"; 
  if (intensity > 0.7) bgColor = "rgba(16, 185, 129, " + (intensity - 0.5) * 0.4 + ")";
  else if (intensity > 0.4) bgColor = "rgba(245, 158, 11, 0.2)"; 

  return (
    <div 
      className="p-4 flex items-center justify-center text-xs font-bold leading-none"
      style={{ backgroundColor: bgColor }}
    >
      {value}
    </div>
  );
}

function IntegrationsView() {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
       <div className="mb-12">
          <h2 className="text-4xl font-display italic text-[#1A1A1A] mb-4">Unified Ecosystem</h2>
          <p className="text-sm text-stone-500 mb-12 max-w-2xl leading-relaxed">
            Timber doesn't just store data; it listens to your existing stack. By integrating Salesforce, Zendesk, HubSpot, and Zoom, we capture sentiment across every touchpoint - from initial onboarding to high-stakes renewals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-600 font-black italic shadow-inner">sf</div>
                <h3 className="text-xl font-bold">Salesforce / HubSpot</h3>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100 italic">
                 <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Benefit</p>
                 <p className="text-xs text-stone-600 leading-relaxed">
                   Automatically log "Revenue Pulse" signals based on contract changes. Align Sales and Success by syncing strategic win plans during the handover phase.
                 </p>
              </div>
              <div className="space-y-3">
                <IntegrationOption label="Sync Executive Summaries" enabled />
                <IntegrationOption label="Revenue Delta Sync" enabled />
                <IntegrationOption label="Pipeline Alignment" enabled={false} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-600 font-black italic shadow-inner">zd</div>
                <h3 className="text-xl font-bold">Zendesk / Intercom</h3>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100 italic">
                 <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Benefit</p>
                 <p className="text-xs text-stone-600 leading-relaxed">
                   Capture passive frustration. We run AI sentiment analysis on every support ticket to catch technical fatigue before it reaches the CSM.
                 </p>
              </div>
              <div className="space-y-3">
                <IntegrationOption label="High Priority Trigger" enabled />
                <IntegrationOption label="Passive Sentiment Scoring" enabled />
                <IntegrationOption label="Ticket Volume Ingest" enabled={false} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 flex items-center justify-center rounded-2xl text-orange-600 font-black italic shadow-inner">zm</div>
                <h3 className="text-xl font-bold">Zoom / Google Meet</h3>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100 italic">
                 <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Benefit</p>
                 <p className="text-xs text-stone-600 leading-relaxed">
                   Live transcript sentiment. During Onboarding and QBRs, Timber records the "Energy Level" of stakeholders to detect unsaid skepticism.
                 </p>
              </div>
              <div className="space-y-3">
                <IntegrationOption label="Call Sentiment Trophies" enabled={false} />
                <IntegrationOption label="Transcribe & Log Pulse" enabled={false} />
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}

function IntegrationOption({ label, enabled }: { label: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-stone-100 rounded-xl">
      <span className="text-xs font-bold text-stone-700">{label}</span>
      <div className={cn(
        "w-8 h-4 rounded-full relative transition-colors cursor-pointer",
        enabled ? "bg-emerald-500" : "bg-stone-200"
      )}>
        <div className={cn(
          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform",
          enabled ? "left-4.5" : "left-0.5"
        )} />
      </div>
    </div>
  );
}

// --- Navigation & Common Components ---

function NavButton({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 md:p-3 rounded-2xl transition-all group relative",
        active ? "bg-[#D81B60] text-white shadow-lg shadow-rose-200" : "text-[#A84A5E] hover:bg-white/40"
      )}
    >
      {icon}
      <span className={cn("text-xs font-bold uppercase tracking-widest block", active ? "opacity-100" : "opacity-70")}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 md:right-3 md:top-auto w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-pulse md:shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

function Header({ title, status, onLogClick, account, isBriefing, onBriefingToggle, onMenuClick }: { 
  title: string, 
  status: string, 
  onLogClick: () => void, 
  account: Account,
  isBriefing: boolean,
  onBriefingToggle: () => void,
  onMenuClick?: () => void
}) {
  return (
    <header className="h-20 md:h-24 border-b border-[#1A1A1A]/5 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 lg:px-12 shrink-0 z-30">
      <div className="flex items-center gap-3 overflow-hidden">
        <button onClick={onMenuClick} className="md:hidden p-2 text-stone-600 hover:bg-stone-50 rounded-lg">
           <Layers className="w-5 h-5 text-[#D81B60]" />
        </button>
        <div className="overflow-hidden">
          <h2 className="text-lg md:text-3xl font-display text-stone-800 leading-tight truncate">{title}</h2>
          <div className="flex items-center gap-2 mt-1 md:mt-2">
             <span className={cn(
               "px-2 py-0.5 text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest shrink-0",
               status === 'Healthy' ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
             )}>{status}</span>
             <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1 hidden sm:flex">
               <Activity className="w-3 h-3" /> {format(new Date(account.metrics.lastTouch), 'MMM d')}
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button 
          onClick={onBriefingToggle}
          className={cn(
            "px-2 md:px-4 py-2 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0",
            isBriefing ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#1A1A1A]/40"
          )}
        >
          {isBriefing ? 'Exit' : 'Briefing'}
        </button>
        <button 
          onClick={onLogClick}
          className="p-2.5 md:prestige-btn bg-[#D81B60] md:bg-[#1A1A1A] text-white rounded-xl md:rounded-full shrink-0"
        >
          <Plus className="w-4 h-4" /> <span className="hidden md:inline">Signal</span>
        </button>
      </div>
    </header>
  );
}

function MetricCard({ label, value, icon, subtext, trend, progress, color = 'rose' }: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  subtext?: string,
  trend?: string,
  progress?: number,
  color?: 'rose' | 'green'
}) {
  return (
    <div className="glass-card p-5 md:p-6 rounded-[2rem] md:rounded-3xl border border-white/40 group relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className="scale-[3]">{icon}</div>
      </div>
      <div className="flex justify-between items-start mb-3">
        <p className="text-[10px] uppercase text-[#A84A5E] font-black tracking-widest">{label}</p>
        <div className={cn(
          "p-2 rounded-xl",
          color === 'rose' ? "bg-pink-50 text-[#D81B60]" : "bg-green-50 text-green-600"
        )}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl md:text-4xl font-display text-stone-800 leading-none">{value}</p>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-stone-100/50 mt-4 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full transition-all duration-1000", color === 'rose' ? "bg-[#D81B60]" : "bg-green-500")}
          />
        </div>
      )}
      {subtext && (
        <p className={cn(
          "text-[10px] mt-3 font-bold uppercase tracking-tight truncate",
          color === 'green' ? "text-green-600" : "text-[#A84A5E]"
        )}>{subtext}</p>
      )}
    </div>
  );
}

function AiWidget({ analysis, isLoading, account }: { analysis: AIAnalysis | null, isLoading: boolean, account: Account }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await chatWithAdvisor(account, userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm unable to process that right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-4 max-w-[95vw]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              className="w-[calc(100vw-2rem)] sm:w-[320px] bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.15)] border border-stone-200 overflow-hidden flex flex-col"
              style={{ maxHeight: '60vh' }}
            >
              <div className="p-5 bg-[#1A1A1A] text-white shrink-0">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#D81B60] flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Advisor</h3>
                        <p className="text-[8px] text-[#A84A5E] font-bold uppercase tracking-widest mt-1">U. Precious</p>
                      </div>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Plus className="w-4 h-4 rotate-45 text-stone-400" />
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-stone-50/30">
                {chatHistory.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                      <p className="text-[8px] font-black text-[#D81B60] uppercase mb-2">Account Strategy</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed italic">"Risk indicators are minimal. I recommend focusing on expansion."</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => setChatInput("Draft a renewal risk email.")} className="p-3 bg-white border border-stone-100 rounded-xl text-[9px] font-bold text-stone-600 hover:border-[#D81B60] text-left transition-all">Risk Email</button>
                      <button onClick={() => setChatInput("Provide a growth playbook.")} className="p-3 bg-white border border-stone-100 rounded-xl text-[9px] font-bold text-stone-600 hover:border-[#D81B60] text-left transition-all">Growth Playbook</button>
                    </div>
                  </motion.div>
                )}

                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end ml-4" : "items-start mr-4")}>
                    <div className={cn(
                      "p-3 rounded-2xl text-[11px] leading-relaxed",
                      msg.role === 'user' ? "bg-[#D81B60] text-white rounded-tr-none" : "bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm"
                    )}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-stone-300 text-[9px] font-bold italic">
                     <Sparkles className="w-3 h-3 animate-spin" /> Strategizing...
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-stone-100">
                <form onSubmit={handleSendQuery} className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Advisor..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-4 pr-10 text-xs focus:outline-none focus:border-[#D81B60] transition-colors"
                  />
                  <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1A1A1A] text-white rounded-lg flex items-center justify-center hover:bg-[#D81B60] transition-colors disabled:opacity-20">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 group relative z-[50]",
            isOpen ? "bg-white text-[#D81B60] ring-2 ring-[#D81B60]" : "bg-[#D81B60] text-white"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
          {!isOpen && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-rose-400 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </>
  );
}

function NudgeManager({ step, onNext, onSkip }: { step: number, onNext: () => void, onSkip: () => void }) {
  const nudges = [
    { 
      title: "Welcome to Timber", 
      text: "This is for Customer Success Managers. Connect Salesforce, Zendesk, and Zoom.", 
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } 
    },
    { 
      title: "Pulse Signals", 
      text: "Log interactions to capture real-time sentiment and score account health.", 
      position: { top: '120px', right: '40px', left: 'auto', transform: 'none' } 
    },
    { 
      title: "Briefing View", 
      text: "Enter Executive Briefing for high-stakes stakeholder summaries.", 
      position: { top: '120px', right: '140px', left: 'auto', transform: 'none' } 
    },
    { 
      title: "Strategic Advisor", 
      text: "Get authoritative AI-driven playbooks for risk and expansion.", 
      position: { bottom: '120px', right: '40px', left: 'auto', top: 'auto', transform: 'none' } 
    }
  ];

  const current = nudges[step];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm pointer-events-auto"
        onClick={onSkip}
      />
      
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "pointer-events-auto w-[calc(100vw-2rem)] max-w-[340px] bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-2 border-[#D81B60]",
          isMobile && step > 0 ? "fixed bottom-10 left-1/2 -translate-x-1/2" : (step === 0 || isMobile ? "relative" : "absolute")
        )}
        style={(!isMobile && step !== 0) ? (current.position as any) : {}}
      >
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#D81B60] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
          {step + 1}
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#D81B60]" />
          <h5 className="text-[10px] font-black uppercase text-[#D81B60] tracking-widest">{current.title}</h5>
        </div>
        <p className="text-sm text-stone-600 mb-8 leading-relaxed font-bold italic">"{current.text}"</p>
        <div className="flex gap-4 items-center">
           <button onClick={onSkip} className="text-[10px] font-bold text-stone-400 uppercase hover:text-stone-600 transition-colors">Skip</button>
           <button onClick={onNext} className="flex-1 py-3 bg-[#D81B60] text-white text-[10px] font-black uppercase rounded-2xl shadow-xl hover:bg-[#C2185B] transition-colors">
             {step === 3 ? "Get Started" : "Next Step"}
           </button>
        </div>

        {/* Pointer Arrow for desktop */}
        {!isMobile && step > 0 && (
          <div className={cn(
            "absolute w-4 h-4 bg-white border-2 border-[#D81B60] rotate-45 -z-10",
            step === 3 ? "bottom-[-10px] right-8" : "top-[-10px] right-8"
          )} />
        )}
      </motion.div>
    </div>
  );
}

function InteractionModal({ onClose, onSubmit, csmId }: { onClose: () => void, onSubmit: (i: Interaction) => void, csmId: string }) {
  const [formData, setFormData] = useState({
    type: 'Weekly Sync' as Interaction['type'],
    tone: '😊' as SentimentTone,
    nps: 8,
    discussionPoints: '',
    risks: '',
    opportunities: '',
    notes: '',
    tags: [] as string[]
  });

  const tones: SentimentTone[] = ['😊', '😐', '😟', '😡', '🙌'];
  const tagOptions = ['Product', 'Positive', 'Risk', 'Engagement', 'Timeline', 'Technical'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4c0519]/20 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-[#FADADD] overflow-hidden flex flex-col max-h-[95vh]"
      >
        <div className="p-5 md:p-8 border-b border-[#FADADD] bg-gradient-to-r from-white to-[#FFF8F9] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-display italic text-[#D81B60]">Log Interaction</h2>
            <p className="text-[9px] md:text-[10px] uppercase font-bold text-[#A84A5E] tracking-widest mt-1">Capture the moment of truth</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><Plus className="rotate-45" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] uppercase font-black text-stone-400">Interaction Type</label>
              <select className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D81B60]"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option>Weekly Sync</option><option>Ad-hoc Check-in</option><option>QBR</option>
                <option>Onboarding</option><option>Renewal</option><option>Support Escalation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] uppercase font-black text-stone-400">Mood Indicator</label>
              <div className="flex justify-between bg-stone-50 p-2 rounded-2xl border border-stone-100">
                {tones.map(t => (
                  <button key={t} type="button" onClick={() => setFormData({...formData, tone: t})}
                    className={cn("w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-lg md:text-xl transition-all",
                    formData.tone === t ? "bg-white shadow-sm ring-1 ring-stone-200" : "opacity-40 hover:opacity-100")}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-[9px] md:text-[10px] uppercase font-black text-stone-400">Event NPS: {formData.nps}</label>
               <span className="text-[9px] md:text-[10px] font-bold text-[#D81B60] uppercase">{formData.nps > 8 ? 'Promoter' : 'Neutral'}</span>
             </div>
             <input type="range" min="0" max="10" step="1" value={formData.nps} onChange={e => setFormData({...formData, nps: parseInt(e.target.value)})}
               className="w-full h-1.5 bg-stone-100 rounded-full appearance-none accent-[#D81B60]" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] uppercase font-black text-stone-400">Executive Summary</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Observed tone and core outcome..." className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#D81B60]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase font-black text-rose-500 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Risks</label>
                <textarea value={formData.risks} onChange={e => setFormData({...formData, risks: e.target.value})}
                  className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl p-3 text-xs h-20 resize-none focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase font-black text-emerald-500 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Opportunities</label>
                <textarea value={formData.opportunities} onChange={e => setFormData({...formData, opportunities: e.target.value})}
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl p-3 text-xs h-20 resize-none focus:outline-none" />
              </div>
            </div>
          </div>
          
          <div className="pb-4">
             <label className="text-[9px] md:text-[10px] uppercase font-black text-stone-400 block mb-3">Classification Tokens</label>
             <div className="flex flex-wrap gap-2">
               {tagOptions.map(t => (
                 <button key={t} type="button" onClick={() => setFormData({...formData, tags: formData.tags.includes(t) ? formData.tags.filter(tag => tag !== t) : [...formData.tags, t]})}
                   className={cn("px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase transition-all",
                   formData.tags.includes(t) ? "bg-[#D81B60] text-white" : "bg-stone-50 text-stone-400 border border-stone-200")}>{t}</button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-[#FADADD] bg-stone-50 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase text-stone-400">Discard</button>
          <button onClick={() => onSubmit({...formData, id: Date.now().toString(), date: new Date().toISOString(), csmId})} 
            className="flex-2 py-3 md:py-4 bg-[#D81B60] text-white text-[9px] md:text-[10px] font-black uppercase rounded-2xl shadow-xl">
            Finalize Pulse
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
