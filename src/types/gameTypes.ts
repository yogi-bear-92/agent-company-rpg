// Consolidated game types for performance optimization
export interface AgentStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  constitution: number;
}

export interface Skill {
  name: string;
  level: number;
  xp: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'tool';
  stats: Partial<AgentStats>;
  durability: number;
  maxDurability: number;
}

export interface AgentRelationship {
  agentId: string;
  type: 'friend' | 'rival' | 'mentor' | 'student';
  strength: number; // -100 to 100
}

export interface CompanyStats {
  reputation: number;
  funds: number;
  projects: number;
  employees: number;
}

export interface Agent {
  id: string;
  name: string;
  level: number;
  experiencePoints: number;
  health: number;
  maxHealth?: number;
  
  // Stats and skills
  stats?: AgentStats;
  skills: Skill[];
  specialization?: string;
  
  // Status and activity
  status: 'idle' | 'busy' | 'training' | 'injured';
  currentQuestId: string | null;
  completedQuests: string[];
  
  // Equipment and inventory
  equipment?: Equipment[];
  inventory?: string[];
  
  // Performance and efficiency
  efficiency: number; // 0.5 to 2.0 multiplier
  performanceHistory?: Array<{
    questId: string;
    completionTime: number;
    rating: number;
    timestamp: number;
  }>;
  
  // Social aspects
  relationships?: AgentRelationship[];
  teamwork?: number;
  leadership?: number;
  
  // Company context
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-10
  requiredLevel: number;
  xpReward: number;
  
  // Requirements
  requiredSkills: string[];
  requiredStats?: Partial<AgentStats>;
  teamSize?: number; // For team quests
  
  // Status and assignment
  status: 'available' | 'in-progress' | 'completed' | 'failed' | 'locked';
  assignedAgentId: string | null;
  assignedTeam?: string[]; // For team quests
  
  // Timing
  timeEstimate: number; // in milliseconds
  deadline?: number; // timestamp
  startTime?: number; // timestamp
  completionTime?: number; // timestamp
  
  // Rewards and consequences
  goldReward?: number;
  itemRewards?: string[];
  skillXpRewards?: Array<{ skill: string; xp: number }>;
  
  // Quest chain and dependencies
  prerequisiteQuests?: string[];
  unlockQuests?: string[];
  questChain?: string;
  
  // Company context
  client?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  budget?: number;
}

export interface QuestCompletion {
  questId: string;
  agentId: string;
  completionTime: number;
  success: boolean;
  rating: number; // 1-5 stars
  optionalObjectivesCompleted: number;
  teamPerformanceBonus?: number;
  timestamp: number;
}

export interface LevelUpEvent {
  agentId: string;
  oldLevel: number;
  newLevel: number;
  skillsUnlocked: string[];
  statsIncreased: Partial<AgentStats>;
  timestamp: number;
}

// Performance-related types
export interface PerformanceMetrics {
  calculationTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface GameState {
  agents: Agent[];
  quests: Quest[];
  completedQuests: QuestCompletion[];
  company: CompanyStats;
  currentTime: number;
  gameSpeed: number;
}

// Component prop types for performance
export interface AgentSheetProps {
  agents?: Agent[];
  onAgentClick?: (agent: Agent) => void;
  className?: string;
}

export interface QuestBoardProps {
  agents: Agent[];
  onQuestAssign: (questId: string, agentId: string) => void;
  onQuestStart: (questId: string) => void;
  onQuestComplete: (completion: QuestCompletion) => void;
}

export interface LevelUpNotificationProps {
  agent: Agent;
  levelUpEvent: LevelUpEvent;
  onClose: () => void;
}