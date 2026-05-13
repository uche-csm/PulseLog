import { Account, CSM } from './types';

export const TEAM: CSM[] = [
  { id: '1', name: 'Uchechukwu Precious', role: 'Team Lead' },
  { id: '2', name: 'Marcus Chen', role: 'CSM' },
  { id: '3', name: 'Elena Rodriguez', role: 'CSM' },
  { id: '4', name: 'David Smith', role: 'CSM' },
  { id: '5', name: 'Priya Patel', role: 'CSM' },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'stellar',
    name: 'Stellar Systems',
    status: 'Healthy',
    csmId: '1',
    metrics: {
      nps: 8.4,
      csat: 4.8,
      healthScore: 92,
      ticketVolume: 3,
      openHighPriorityTickets: 0,
      lastQBRDate: '2024-03-15',
      isQBRMissed: false,
      productUsageScore: 85,
      engagementLevel: 'High',
      lastTouch: '2024-05-10',
    },
    interactions: [
      {
        id: 'i1',
        date: '2024-05-10',
        type: 'Weekly Sync',
        tone: '😊',
        tags: ['Product', 'Positive'],
        discussionPoints: 'Discussed Q3 roadmap and new feature adoption.',
        risks: 'None',
        opportunities: 'Interested in advanced analytics module.',
        nps: 9,
        notes: 'Client thrilled with new feature rollouts.',
        csmId: '1',
      },
      {
        id: 'i2',
        date: '2024-05-03',
        type: 'Ad-hoc Check-in',
        tone: '😐',
        tags: ['Risk'],
        discussionPoints: 'Integration timeline concerns.',
        risks: 'Q3 timeline might slip.',
        opportunities: 'Help from professional services.',
        nps: 7,
        notes: 'Concerned about Q3 integration timeline.',
        csmId: '1',
      }
    ],
    periodicNPS: [
      { id: 'p1', date: '2024-04-01', score: 8, period: 'Monthly' },
      { id: 'p2', date: '2024-01-01', score: 7, period: 'Quarterly' }
    ]
  },
  {
    id: 'cloudnexus',
    name: 'CloudNexus',
    status: 'At Risk',
    csmId: '2',
    metrics: {
      nps: 4.2,
      csat: 3.1,
      healthScore: 55,
      ticketVolume: 12,
      openHighPriorityTickets: 4,
      lastQBRDate: '2023-12-01',
      isQBRMissed: true,
      productUsageScore: 45,
      engagementLevel: 'Medium',
      lastTouch: '2024-05-08',
    },
    interactions: [],
    periodicNPS: []
  },
  {
    id: 'terrafoundry',
    name: 'TerraFoundry',
    status: 'At Risk',
    csmId: '3',
    metrics: {
      nps: 2.5,
      csat: 2.2,
      healthScore: 32,
      ticketVolume: 25,
      openHighPriorityTickets: 8,
      lastQBRDate: '2023-11-20',
      isQBRMissed: true,
      productUsageScore: 30,
      engagementLevel: 'Low',
      lastTouch: '2024-05-01',
    },
    interactions: [],
    periodicNPS: []
  },
  {
    id: 'biopulse',
    name: 'BioPulse',
    status: 'Healthy',
    csmId: '4',
    metrics: {
      nps: 9.1,
      csat: 4.9,
      healthScore: 98,
      ticketVolume: 1,
      openHighPriorityTickets: 0,
      lastQBRDate: '2024-04-10',
      isQBRMissed: false,
      productUsageScore: 95,
      engagementLevel: 'High',
      lastTouch: '2024-05-11',
    },
    interactions: [],
    periodicNPS: []
  }
];
