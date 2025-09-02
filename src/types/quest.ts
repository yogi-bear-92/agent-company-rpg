// Quest and mission system types for Agent Company RPG

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'locked';
export type QuestType = 'main' | 'side' | 'daily' | 'epic' | 'raid';
export type MissionCategory = 'Combat' | 'Investigation' | 'Creation' | 'Exploration' | 'Diplomacy' | 'Training';
export type Difficulty = 'Tutorial' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Legendary';

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
  optional?: boolean;
}

export interface QuestReward {
  xp: number;
  gold?: number;
  items?: string[];
  skillPoints?: number;
  reputation?: { faction: string; amount: number }[];
  unlocks?: string[];
}

export interface QuestRequirement {
  minLevel?: number;
  maxLevel?: number;
  requiredClass?: string[];
  requiredSkills?: { skill: string; level: number }[];
  requiredQuests?: string[];
  teamSize?: { min: number; max: number };
  requiredItems?: string[];
}

export interface QuestDialogue {
  npc: string;
  text: string;
  timestamp: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  lore?: string;
  type: QuestType;
  category: MissionCategory;
  difficulty: Difficulty;
  status: QuestStatus;
  icon: string;
  
  // Progress tracking
  objectives: QuestObjective[];
  currentObjectiveIndex: number;
  progressPercentage: number;
  timeLimit?: number; // in minutes
  timeRemaining?: number;
  
  // Requirements & rewards
  requirements: QuestRequirement;
  rewards: QuestReward;
  bonusRewards?: QuestReward; // For completing optional objectives
  
  // Assignment & team
  assignedAgents: number[];
  recommendedTeamSize: number;
  autoAssign: boolean;
  
  // Narrative & dialogue
  dialogue: QuestDialogue[];
  completionMessage?: string;
  failureMessage?: string;
  
  // Metadata
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  repeatable: boolean;
  cooldownHours?: number;
  lastCompletedBy?: number[];
  
  // Integration with Claude Flow
  githubIssue?: string;
  swarmTaskId?: string;
  knowledgeRequired?: string[];
}

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  quests: string[]; // Quest IDs in order
  currentQuestIndex: number;
  completed: boolean;
  finalReward: QuestReward;
}

export interface QuestLog {
  activeQuests: Quest[];
  availableQuests: Quest[];
  completedQuests: Quest[];
  failedQuests: Quest[];
  questChains: QuestChain[];
  statistics: QuestStatistics;
}

export interface QuestStatistics {
  totalCompleted: number;
  totalFailed: number;
  totalXpEarned: number;
  averageCompletionTime: number;
  favoriteQuestType: QuestType;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface QuestFilter {
  type?: QuestType[];
  category?: MissionCategory[];
  difficulty?: Difficulty[];
  status?: QuestStatus[];
  agentClass?: string[];
  minRewardXp?: number;
  hideCompleted?: boolean;
  hideLocked?: boolean;
}

export interface QuestSortOptions {
  by: 'difficulty' | 'xp' | 'timeRemaining' | 'progress' | 'type' | 'newest';
  direction: 'asc' | 'desc';
}

// Quest generation templates
export interface QuestTemplate {
  id: string;
  name: string;
  baseXp: number;
  difficultyModifier: number;
  objectiveTemplates: string[];
  possibleRewards: string[];
  narrativeTheme: string;
}

// Real-time quest events
export interface QuestEvent {
  questId: string;
  eventType: 'started' | 'progress' | 'completed' | 'failed' | 'objective_complete' | 'team_joined' | 'team_left';
  agentId?: number;
  timestamp: Date;
  details?: Record<string, unknown>;
}