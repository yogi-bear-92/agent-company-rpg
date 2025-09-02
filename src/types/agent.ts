// Core agent data types for the Agent Company RPG

export interface AgentStats {
  intelligence: number;
  creativity: number;
  reliability: number;
  speed: number;
  leadership: number;
}

export interface KnowledgeDomain {
  [domain: string]: number; // Domain expertise level 0-100
}

export interface CrawlingProgress {
  active: boolean;
  currentUrl?: string;
  lastUrl?: string;
  pagesLearned: number;
  knowledgeGained: number;
}

export interface KnowledgeBase {
  totalMemories: number;
  recentLearning: string;
  knowledgeDomains: KnowledgeDomain;
  crawlingProgress: CrawlingProgress;
}

export interface Equipment {
  primary: string;
  secondary: string;
  utility: string;
}

export interface AgentRelationship {
  agentId: number;
  type: 'mentor' | 'apprentice' | 'colleague';
  strength: number; // 0-100
  recentInteraction: string;
}

export interface SkillLevel {
  level: number;
  maxLevel: number;
  unlocked: boolean;
  recentProgress?: string;
}

export interface SkillTree {
  [skillName: string]: SkillLevel;
}

export interface RealtimeActivity {
  timestamp: string;
  action: string;
  xpGained?: number;
  synergy?: string;
  confidence?: string;
  relationship?: string;
  skillBoost?: string;
  participants?: number;
  missionStart?: boolean;
}

export interface Agent {
  id: number;
  name: string;
  class: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: AgentStats;
  specializations: string[];
  currentMission: string;
  personality: string;
  avatar: string;
  knowledgeBase: KnowledgeBase;
  equipment: Equipment;
  relationships: AgentRelationship[];
  skillTree: SkillTree;
  realtimeActivity: RealtimeActivity[];
}

// Quest and mission types
export interface Quest {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  xpReward: number;
  assignedTo: string;
  progress: number;
  knowledgeSource: string;
  estimatedCompletion: string;
  type?: 'Combat' | 'Investigation' | 'Creation';
  requirements?: {
    skillLevel?: number;
    agentClass?: string;
    teamSize?: number;
  };
}

// Guild statistics
export interface GuildStats {
  totalAgents: number;
  activeAgents: number;
  completedMissions: number;
  totalXP: number;
  guildLevel: number;
  knowledgeNetworkHealth: number;
  totalKnowledgeItems: number;
  realtimeLearning: boolean;
  collaborativeSessions: number;
}

// Knowledge network
export interface KnowledgeNetworkDomain {
  name: string;
  items: number;
  growth: string;
}

export interface KnowledgeNetworkActivity {
  agent: string;
  action: string;
  timeAgo: string;
}

export interface KnowledgeNetwork {
  totalNodes: number;
  connections: number;
  recentGrowth: string;
  topDomains: KnowledgeNetworkDomain[];
  recentActivity: KnowledgeNetworkActivity[];
}

// Claude Code integration types
export interface ClaudeCodeTask {
  id: string;
  agentId: number;
  taskType: 'swarm' | 'individual';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  subtasks: string[];
  createdAt: Date;
  completedAt?: Date;
}

// UI state types
export interface AppState {
  activeTab: 'guild' | 'knowledge' | 'analytics' | 'quests';
  selectedAgent: Agent | null;
  expandedSkillTrees: { [agentId: number]: boolean };
  knowledgeConnected: boolean;
  realtimeUpdates: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SwarmTaskResponse {
  taskId: string;
  swarmId: string;
  status: 'initializing' | 'active' | 'completed' | 'failed';
  agents: number[];
  progress: number;
}