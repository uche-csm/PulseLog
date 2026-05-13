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
  Heart
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

import { Account, Interaction, SentimentTone, AIAnalysis, CSM } from './types';
import { MOCK_ACCOUNTS, TEAM } from './mockData';
import { analyzeAccountSentiment } from './services/aiDirector';

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
  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [currentNudge, setCurrentNudge] = useState<number | null>(0); // 0 = start onboarding

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
    <div className="flex h-screen bg-[#FFF8F9] text-[#2D2D2D] font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-rose-200 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 bg-[#FFE4E9] border-r border-[#FADADD] flex flex-col shrink-0 z-20 transition-all duration-300">
        <div className="p-6 border-b border-[#FADADD] flex flex-col items-center md:items-start shrink-0">
          <h1 className="text-2xl md:text-3xl font-display italic text-[#D81B60] leading-tight hidden md:block">PulseLog</h1>
          <TrendingUp className="w-8 h-8 text-[#D81B60] md:hidden" />
          <p className="text-[10px] uppercase tracking-widest text-[#A84A5E] font-bold mt-1 hidden md:block">CSM Intelligence</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <NavButton 
              active={activeTab === 'Dashboard'} 
              onClick={() => setActiveTab('Dashboard')}
              icon={<Layers className="w-5 h-5" />}
              label="Overview"
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

          <div className="pt-6 hidden md:block">
            <div className="text-[11px] uppercase tracking-wider text-[#A84A5E] mb-3 px-2 font-bold font-georgia italic">Active Accounts</div>
            <div className="space-y-1">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setActiveTab('Dashboard');
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group",
                    selectedAccountId === acc.id && activeTab === 'Dashboard'
                      ? "bg-white shadow-sm border border-[#FADADD] scale-[1.02]" 
                      : "hover:bg-white/40 opacity-70 hover:opacity-100"
                  )}
                >
                  <span className="font-medium text-xs text-stone-700 truncate mr-2">{acc.name}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    acc.status === 'Healthy' ? "bg-green-500" : "bg-rose-500"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#FADADD] bg-[#FCE8EB] mt-auto shrink-0">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-8 h-8 rounded-full bg-[#D81B60] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
              UP
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-bold">U. Precious</p>
              <p className="text-[9px] text-[#A84A5E]">Team Lead</p>
            </div>
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
            />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
              <DashboardView account={selectedAccount} />
            </div>
          </div>
        )}

        {activeTab === 'Alerts' && (
           <div className="flex flex-col h-full overflow-hidden">
            <AlertsView highRiskAccounts={highRiskAccounts} onSelect={(id) => {
              setSelectedAccountId(id);
              setActiveTab('Dashboard');
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
        isOpen={isAiWidgetOpen} 
        onToggle={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
        analysis={aiAnalysis}
        isLoading={isLoadingAi}
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

function DashboardView({ account }: { account: Account }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          label="Account NPS" 
          value={account.metrics.nps.toFixed(1)} 
          icon={<BarChart3 className="w-4 h-4" />}
          progress={account.metrics.nps * 10}
        />
        <MetricCard 
          label="CSAT Score" 
          value={account.metrics.csat.toFixed(1)} 
          icon={<Sparkles className="w-4 h-4" />}
          progress={account.metrics.csat * 20}
          color="green"
        />
        <MetricCard 
          label="Support Volume" 
          value={account.metrics.ticketVolume.toString()} 
          icon={<Ticket className="w-4 h-4" />}
          subtext={`${account.metrics.openHighPriorityTickets} Priority Tickets`}
        />
        <MetricCard 
          label="Product Usage" 
          value={`${account.metrics.productUsageScore}%`} 
          icon={<TrendingUp className="w-4 h-4" />}
          subtext="MoM trend: Stable"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-display font-medium">Sentiment Trend History</h3>
              <p className="text-[10px] text-[#A84A5E] font-bold uppercase tracking-widest">Enterprise High-Touch Tracking</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={account.interactions.slice().reverse()}>
                  <defs>
                    <linearGradient id="colorHighNps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D81B60" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#D81B60" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FADADD" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#A84A5E'}} 
                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#A84A5E'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #FADADD', fontSize: '11px', boxShadow: 'none', background: 'rgba(255,255,255,0.9)' }} />
                  <Area type="monotone" dataKey="nps" stroke="#D81B60" strokeWidth={3} fill="url(#colorHighNps)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-[#D81B60]" />
            <h3 className="text-xl font-display font-medium">Recent Pulse Logs</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {account.interactions.length > 0 ? (
              account.interactions.map(interaction => (
                <div key={interaction.id} className="relative pl-6 pb-6 border-l border-[#FADADD] last:border-0 last:pb-0 group">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#D81B60] ring-4 ring-white" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-[#A84A5E] uppercase tracking-tighter">{format(new Date(interaction.date), 'MMM d, yyyy')}</span>
                    <span className="text-lg">{interaction.tone}</span>
                  </div>
                  <h4 className="text-xs font-bold mb-1">{interaction.type}</h4>
                  <p className="text-[11px] text-stone-600 italic line-clamp-2">"{interaction.notes}"</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {interaction.tags.map(t => (
                      <span key={t} className="text-[8px] bg-pink-50 text-[#D81B60] px-1.5 py-0.5 rounded border border-pink-100 font-bold uppercase">{t}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-sm">No pulses recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsView({ highRiskAccounts, onSelect }: { highRiskAccounts: Account[], onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-display italic text-rose-700 flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
          Red Alert Command
        </h2>
        <p className="text-sm text-stone-500 mt-2 max-w-xl">Critical accounts needing immediate intervention. Priority indicators: volume spikes, low NPS, missed QBRs.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highRiskAccounts.map(acc => (
            <motion.div 
              key={acc.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelect(acc.id)}
              className="bg-white border-2 border-rose-100 p-6 rounded-3xl shadow-lg cursor-pointer hover:border-rose-400 transition-all flex flex-col"
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

              <button className="mt-auto w-full py-3 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-colors shadow-md shadow-rose-100">
                Enter War Room
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
        <h2 className="text-3xl font-display italic text-[#D81B60]">Health Matrix Heatmap</h2>
        <p className="text-sm text-stone-500 mt-2">Core metric benchmarking across the enterprise portfolio.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-[#FADADD] overflow-hidden flex flex-col shadow-sm">
        <div className="grid grid-cols-6 border-b border-[#FADADD] bg-stone-50 shrink-0">
          <div className="p-4 text-[10px] uppercase font-black text-stone-500 tracking-wider">Account</div>
          {metrics.map(m => (
            <div key={m} className="p-4 text-[10px] uppercase font-black text-stone-500 tracking-wider text-center">{m}</div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {accounts.map(acc => (
            <div key={acc.id} className="grid grid-cols-6 border-b border-stone-100 hover:bg-stone-50 transition-colors">
              <div className="p-4 font-bold text-xs truncate">{acc.name}</div>
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
          <h2 className="text-3xl font-display italic text-[#D81B60] mb-4">Ecosystem Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#FADADD] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-600 font-black italic">sf</div>
                <h3 className="text-xl font-bold">Salesforce Truth</h3>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100">
                 <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Architectural Logic</p>
                 <p className="text-xs text-stone-600 leading-relaxed italic">
                   "We sync **Filtered Outcomes** as Tasks. Raw pulse logs are internal to the Success team. This preserves the 'Luxury' nature of CS work while ensuring Sales visibility."
                 </p>
              </div>
              <div className="space-y-3">
                <IntegrationOption label="Sync Executive Summaries" enabled />
                <IntegrationOption label="Account Health Mapping" enabled />
                <IntegrationOption label="Closed-Loop Feedback" enabled={false} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#FADADD] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-600 font-black italic">zd</div>
                <h3 className="text-xl font-bold">Zendesk Health</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-6">
                Sentiment analysis on technical tickets allows PulseLog to identify "Quiet Churn" signals before any human interaction.
              </p>
              <div className="space-y-3">
                <IntegrationOption label="High Priority Trigger" enabled />
                <IntegrationOption label="Volume Scoring Ingest" enabled />
                <IntegrationOption label="Ticket Sentiment Sync" enabled={false} />
              </div>
            </div>
          </div>
       </div>

       <div className="bg-[#FFF1F2] p-8 rounded-[40px] border border-rose-100 flex flex-col md:flex-row items-center gap-8 mb-12">
         <div className="flex-1">
           <h4 className="text-2xl font-display italic text-rose-800 mb-2">Proactive Automation Engine</h4>
           <p className="text-sm text-rose-700/70">Connecting your stack triggers the Red Alert view instantly when high-velocity indicators shift.</p>
         </div>
         <button className="px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-200 uppercase tracking-widest text-xs">Authorize Connectors</button>
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
        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative",
        active ? "bg-[#D81B60] text-white shadow-lg shadow-rose-200" : "text-[#A84A5E] hover:bg-white/40"
      )}
    >
      {icon}
      <span className={cn("text-xs font-bold uppercase tracking-widest hidden md:block", active ? "opacity-100" : "opacity-70")}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 md:right-3 md:top-auto w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-pulse md:shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

function Header({ title, status, onLogClick, account }: { title: string, status: string, onLogClick: () => void, account: Account }) {
  return (
    <header className="h-20 border-b border-[#FADADD] bg-white/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
        <div className="overflow-hidden">
          <h2 className="text-lg md:text-2xl font-display font-medium text-stone-800 leading-tight truncate">{title}</h2>
          <div className="flex items-center gap-3 mt-1">
             <span className={cn(
               "px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-widest shrink-0",
               status === 'Healthy' ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
             )}>{status}</span>
             <span className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-1 hidden sm:flex">
               <Clock className="w-3 h-3" /> {format(new Date(account.metrics.lastTouch), 'MMM d')}
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button 
          onClick={onLogClick}
          className="bg-[#D81B60] hover:bg-[#C2185B] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform hover:scale-[1.02] shadow-xl shadow-rose-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Interaction</span>
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
    <div className="glass-card p-5 md:p-6 rounded-3xl border border-white/40 group relative overflow-hidden">
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
        <div className="h-1 w-full bg-stone-100/50 mt-4 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full transition-all duration-1000", color === 'rose' ? "bg-[#D81B60]" : "bg-green-500")}
          />
        </div>
      )}
      {subtext && (
        <p className={cn(
          "text-[9px] mt-3 font-bold uppercase tracking-tight truncate",
          color === 'green' ? "text-green-600" : "text-[#A84A5E]"
        )}>{subtext}</p>
      )}
    </div>
  );
}

function AiWidget({ isOpen, onToggle, analysis, isLoading }: { isOpen: boolean, onToggle: () => void, analysis: AIAnalysis | null, isLoading: boolean }) {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 max-w-[90vw]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="w-full sm:w-[350px] bg-white rounded-[32px] shadow-2xl border border-rose-100 overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              <div className="p-6 bg-gradient-to-br from-[#D81B60] to-[#AD1457] text-white shrink-0">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2 mb-4">
                      <BrainCircuit className="w-5 h-5" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Assistant</h3>
                   </div>
                   <button onClick={onToggle} className="p-1 hover:bg-white/10 rounded-lg">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                   </button>
                </div>
                {isLoading ? (
                  <div className="h-8 w-2/3 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h4 className="text-2xl font-display italic leading-tight">Sentiment is {analysis?.trend}</h4>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-stone-50 rounded animate-pulse" />
                    <div className="h-20 w-full bg-stone-50 rounded animate-pulse" />
                  </div>
                ) : analysis && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase font-black text-stone-400 mb-2">Strategic Outlook</p>
                      <p className="text-xs leading-relaxed text-stone-600 bg-stone-50 p-4 rounded-2xl italic border border-stone-100">
                        "{analysis.summary}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                         <p className="text-[9px] font-black text-rose-700 uppercase mb-1">Risk</p>
                         <p className="text-xs font-bold text-rose-900">{analysis.churnRisk}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                         <p className="text-[9px] font-black text-emerald-700 uppercase mb-1">Growth</p>
                         <p className="text-xs font-bold text-emerald-900">{analysis.expansionPotential}</p>
                      </div>
                    </div>
                    <div className="pb-4">
                      <p className="text-[10px] uppercase font-black text-[#D81B60] mb-3">Priority Actions</p>
                      <ul className="space-y-3">
                        {analysis.recommendedActions.map((a, i) => (
                          <li key={i} className="flex gap-3 text-xs text-stone-700">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D81B60]" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={onToggle}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 group relative overflow-hidden",
            isOpen ? "bg-white text-[#D81B60] ring-2 ring-[#D81B60]" : "bg-[#D81B60] text-white"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:translate-y-full transition-transform" />
          <BrainCircuit className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
          {!isOpen && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-rose-400 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
      </div>
    </>
  );
}

function NudgeManager({ step, onNext, onSkip }: { step: number, onNext: () => void, onSkip: () => void }) {
  const nudges = [
    { title: "Welcome to PulseLog", text: "The luxury workspace for Enterprise CSMs. Let's start the briefing.", position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { title: "Command Center", text: "Log your first pulse here to activate AI sentiment tracking.", position: { top: '80px', right: '40px' } },
    { title: "The War Room", text: "Red alerts appear here. Proactive churn prevention at scale.", position: { top: '150px', left: '260px' } },
    { title: "Intelligence Engine", text: "Expert strategy, powered by Gemini. Open this widget for live account playbooks.", position: { bottom: '100px', right: '100px' } }
  ];

  const current = nudges[step];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px]" />
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={current.position as any}
        className="absolute pointer-events-auto w-64 md:w-80 bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border-2 border-[#D81B60]"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#D81B60]" />
          <h5 className="text-[10px] font-black uppercase text-[#D81B60] tracking-widest">{current.title}</h5>
        </div>
        <p className="text-sm text-stone-600 mb-8 leading-relaxed font-bold italic">"{current.text}"</p>
        <div className="flex gap-4 items-center">
           <button onClick={onSkip} className="text-[10px] font-bold text-stone-400 uppercase hover:text-stone-600 transition-colors">Skip Tour</button>
           <button onClick={onNext} className="flex-1 py-3 bg-[#D81B60] text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-pink-100 hover:bg-[#C2185B] transition-colors">{step === 3 ? "Complete Onboarding" : "Next Briefing"}</button>
        </div>
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
        <div className="p-8 border-b border-[#FADADD] bg-gradient-to-r from-white to-[#FFF8F9] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-display italic text-[#D81B60]">Log Interaction</h2>
            <p className="text-[10px] uppercase font-bold text-[#A84A5E] tracking-widest mt-1">Capture the moment of truth</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><Plus className="rotate-45" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-stone-400">Interaction Type</label>
              <select className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D81B60]"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option>Weekly Sync</option><option>Ad-hoc Check-in</option><option>QBR</option>
                <option>Onboarding</option><option>Renewal</option><option>Support Escalation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-stone-400">Mood Indicator</label>
              <div className="flex justify-between bg-stone-50 p-2 rounded-2xl border border-stone-100">
                {tones.map(t => (
                  <button key={t} type="button" onClick={() => setFormData({...formData, tone: t})}
                    className={cn("w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all",
                    formData.tone === t ? "bg-white shadow-sm ring-1 ring-stone-200" : "opacity-40 hover:opacity-100")}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-[10px] uppercase font-black text-stone-400">Event NPS: {formData.nps}</label>
               <span className="text-[10px] font-bold text-[#D81B60] uppercase">{formData.nps > 8 ? 'Promoter' : 'Neutral'}</span>
             </div>
             <input type="range" min="0" max="10" step="1" value={formData.nps} onChange={e => setFormData({...formData, nps: parseInt(e.target.value)})}
               className="w-full h-1.5 bg-stone-100 rounded-full appearance-none accent-[#D81B60]" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-stone-400">Executive Summary</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Observed tone and core outcome..." className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#D81B60]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-rose-500 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Risks</label>
                <textarea value={formData.risks} onChange={e => setFormData({...formData, risks: e.target.value})}
                  className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl p-3 text-xs h-20 resize-none focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-emerald-500 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Opportunities</label>
                <textarea value={formData.opportunities} onChange={e => setFormData({...formData, opportunities: e.target.value})}
                  className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl p-3 text-xs h-20 resize-none focus:outline-none" />
              </div>
            </div>
          </div>
          
          <div className="pb-4">
             <label className="text-[10px] uppercase font-black text-stone-400 block mb-3">Classification Tokens</label>
             <div className="flex flex-wrap gap-2">
               {tagOptions.map(t => (
                 <button key={t} type="button" onClick={() => setFormData({...formData, tags: formData.tags.includes(t) ? formData.tags.filter(tag => tag !== t) : [...formData.tags, t]})}
                   className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all",
                   formData.tags.includes(t) ? "bg-[#D81B60] text-white" : "bg-stone-50 text-stone-400 border border-stone-200")}>{t}</button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-[#FADADD] bg-stone-50 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase text-stone-400">Discard</button>
          <button onClick={() => onSubmit({...formData, id: Date.now().toString(), date: new Date().toISOString(), csmId})} 
            className="flex-2 py-4 bg-[#D81B60] text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-pink-200">
            Finalize Pulse
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
