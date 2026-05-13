export type SentimentTone = '😊' | '😐' | '😟' | '😡' | '🙌';

export interface Interaction {
  id: string;
  date: string;
  type: 'Weekly Sync' | 'Ad-hoc Check-in' | 'QBR' | 'Onboarding' | 'Renewal' | 'Support Escalation';
  tone: SentimentTone;
  tags: string[];
  discussionPoints: string;
  risks: string;
  opportunities: string;
  nps: number; // 0-10
  notes: string;
  csmId: string;
}

export interface HealthMetric {
  nps: number;
  csat: number;
  healthScore: number;
  ticketVolume: number;
  openHighPriorityTickets: number;
  lastQBRDate: string;
  isQBRMissed: boolean;
  productUsageScore: number; // 0-100
  engagementLevel: 'High' | 'Medium' | 'Low' | 'Critical';
  lastTouch: string;
}

export interface PeriodicNPS {
  id: string;
  date: string;
  score: number;
  period: 'Monthly' | 'Quarterly';
}

export interface Account {
  id: string;
  name: string;
  status: 'Healthy' | 'At Risk' | 'Churned' | 'Onboarding';
  csmId: string;
  metrics: HealthMetric;
  interactions: Interaction[];
  periodicNPS: PeriodicNPS[];
}

export interface CSM {
  id: string;
  name: string;
  role: 'Team Lead' | 'CSM';
  avatar?: string;
}

export interface AIAnalysis {
  trend: 'Rising' | 'Declining' | 'Stable' | 'Volatile';
  summary: string;
  riskSignals: string[];
  opportunitySignals: string[];
  churnRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  expansionPotential: 'None' | 'Low' | 'Medium' | 'High';
  recommendedActions: string[];
}
