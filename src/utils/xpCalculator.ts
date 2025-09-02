// XP calculation and level progression utilities for Agent Company RPG

import { Agent, AgentStats } from '../types/agent';
import { Quest } from '../types/quest';

// XP multipliers and constants
const BASE_XP_TO_NEXT_LEVEL = 100;
const LEVEL_XP_MULTIPLIER = 1.5;
const DIFFICULTY_MULTIPLIERS = {
  Tutorial: 0.5,
  Easy: 1.0,
  Medium: 1.5,
  Hard: 2.0,
  Expert: 3.0,
  Legendary: 5.0
};

const CLASS_XP_BONUSES = {
  'Code Master': { Investigation: 1.2, Creation: 1.3 },
  'Data Sage': { Investigation: 1.3, Exploration: 1.2 },
  'Creative Bard': { Creation: 1.3, Diplomacy: 1.2 },
  'Rapid Scout': { Exploration: 1.3, Combat: 1.2 },
  'System Architect': { Creation: 1.2, Training: 1.3 },
  'Bug Hunter': { Investigation: 1.3, Combat: 1.3 },
  'Documentation Wizard': { Creation: 1.2, Diplomacy: 1.3 }
};

// Calculate XP required for next level
export function calculateXpToNextLevel(level: number): number {
  return Math.floor(BASE_XP_TO_NEXT_LEVEL * Math.pow(LEVEL_XP_MULTIPLIER, level - 1));
}

// Calculate total XP from level 1 to target level
export function calculateTotalXpForLevel(targetLevel: number): number {
  let totalXp = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXp += calculateXpToNextLevel(level);
  }
  return totalXp;
}

// Calculate level from total XP
export function calculateLevelFromXp(totalXp: number): { level: number; currentLevelXp: number; xpToNext: number } {
  let level = 1;
  let remainingXp = totalXp;
  
  while (remainingXp >= calculateXpToNextLevel(level)) {
    remainingXp -= calculateXpToNextLevel(level);
    level++;
  }
  
  return {
    level,
    currentLevelXp: remainingXp,
    xpToNext: calculateXpToNextLevel(level)
  };
}

// Calculate XP reward for completing a quest
export function calculateQuestXpReward(
  quest: Quest,
  agent: Agent,
  completionTime?: number, // in minutes
  optionalObjectivesCompleted: number = 0
): number {
  let xpReward = quest.rewards.xp;
  
  // Apply difficulty multiplier
  xpReward *= DIFFICULTY_MULTIPLIERS[quest.difficulty] || 1.0;
  
  // Apply class bonus if applicable
  const classBonus = CLASS_XP_BONUSES[agent.class as keyof typeof CLASS_XP_BONUSES];
  if (classBonus && classBonus[quest.category as keyof typeof classBonus]) {
    xpReward *= classBonus[quest.category as keyof typeof classBonus];
  }
  
  // Time bonus (complete faster than expected)
  if (completionTime && quest.timeLimit) {
    const timeRatio = completionTime / quest.timeLimit;
    if (timeRatio < 0.5) {
      xpReward *= 1.5; // 50% bonus for completing in half the time
    } else if (timeRatio < 0.75) {
      xpReward *= 1.25; // 25% bonus for completing in 3/4 time
    } else if (timeRatio < 1.0) {
      xpReward *= 1.1; // 10% bonus for beating the timer
    }
  }
  
  // Optional objectives bonus
  const totalOptionalObjectives = quest.objectives.filter(obj => obj.optional).length;
  if (totalOptionalObjectives > 0 && optionalObjectivesCompleted > 0) {
    const optionalRatio = optionalObjectivesCompleted / totalOptionalObjectives;
    xpReward += (quest.bonusRewards?.xp || 0) * optionalRatio;
  }
  
  // Team synergy bonus (if multiple agents)
  if (quest.assignedAgents.length > 1) {
    const synergyBonus = 1 + (quest.assignedAgents.length - 1) * 0.05; // 5% per additional agent
    xpReward *= Math.min(synergyBonus, 1.25); // Cap at 25% bonus
  }
  
  // Streak bonus (if agent has been completing quests consistently)
  const streakBonus = calculateStreakBonus(agent);
  xpReward *= streakBonus;
  
  return Math.floor(xpReward);
}

// Calculate XP for partial quest completion
export function calculatePartialQuestXp(
  quest: Quest,
  completedObjectives: number,
  totalObjectives: number
): number {
  const completionRatio = completedObjectives / totalObjectives;
  return Math.floor(quest.rewards.xp * completionRatio * 0.5); // 50% efficiency for partial completion
}

// Calculate streak bonus based on recent activity
export function calculateStreakBonus(agent: Agent): number {
  const recentActivity = agent.realtimeActivity.filter(
    activity => activity.xpGained && activity.xpGained > 0
  );
  
  if (recentActivity.length >= 10) return 1.3; // 30% bonus for hot streak
  if (recentActivity.length >= 5) return 1.15; // 15% bonus for good streak
  if (recentActivity.length >= 3) return 1.05; // 5% bonus for starting streak
  return 1.0; // No streak bonus
}

// Calculate XP from skill usage
export function calculateSkillXp(
  skillLevel: number,
  usageComplexity: 'simple' | 'moderate' | 'complex' = 'moderate'
): number {
  const complexityMultipliers = {
    simple: 0.5,
    moderate: 1.0,
    complex: 2.0
  };
  
  const baseXp = 10;
  const levelBonus = skillLevel * 2;
  const complexityMultiplier = complexityMultipliers[usageComplexity];
  
  return Math.floor(baseXp * complexityMultiplier + levelBonus);
}

// Calculate XP from collaboration
export function calculateCollaborationXp(
  participantCount: number,
  taskComplexity: 'low' | 'medium' | 'high',
  successRate: number // 0-1
): number {
  const complexityBase = {
    low: 20,
    medium: 50,
    high: 100
  };
  
  const baseXp = complexityBase[taskComplexity];
  const teamBonus = Math.log2(participantCount + 1) * 10; // Logarithmic scaling for team size
  const successMultiplier = 0.5 + (successRate * 0.5); // 50-100% based on success
  
  return Math.floor((baseXp + teamBonus) * successMultiplier);
}

// Calculate XP from knowledge acquisition
export function calculateKnowledgeXp(
  knowledgeItems: number,
  domainExpertise: number, // 0-100
  isNewDomain: boolean
): number {
  const baseXpPerItem = 5;
  const expertiseMultiplier = 1 + (domainExpertise / 100); // 1x to 2x based on expertise
  const newDomainBonus = isNewDomain ? 50 : 0;
  
  return Math.floor(knowledgeItems * baseXpPerItem * expertiseMultiplier + newDomainBonus);
}

// Apply XP to agent and handle level up
export function applyXpToAgent(
  agent: Agent,
  xpGained: number,
  source: string
): {
  updatedAgent: Agent;
  leveledUp: boolean;
  newLevel?: number;
  unlockedSkills?: string[];
} {
  const totalXp = agent.xp + xpGained;
  const currentLevelData = calculateLevelFromXp(totalXp);
  
  const leveledUp = currentLevelData.level > agent.level;
  const updatedAgent: Agent = {
    ...agent,
    xp: currentLevelData.currentLevelXp,
    xpToNext: currentLevelData.xpToNext,
    level: currentLevelData.level,
    realtimeActivity: [
      {
        timestamp: new Date().toISOString(),
        action: source,
        xpGained: xpGained
      },
      ...agent.realtimeActivity.slice(0, 49) // Keep last 50 activities
    ]
  };
  
  // Handle level up bonuses
  if (leveledUp) {
    updatedAgent.stats = applyLevelUpStatBonus(updatedAgent.stats, currentLevelData.level);
    const unlockedSkills = getUnlockedSkillsForLevel(currentLevelData.level, agent.class);
    
    return {
      updatedAgent,
      leveledUp: true,
      newLevel: currentLevelData.level,
      unlockedSkills
    };
  }
  
  return {
    updatedAgent,
    leveledUp: false
  };
}

// Apply stat bonuses on level up
function applyLevelUpStatBonus(stats: AgentStats, newLevel: number): AgentStats {
  const statBonus = Math.floor(newLevel / 5) + 1; // +1 to all stats every 5 levels, minimum +1
  
  return {
    intelligence: stats.intelligence + statBonus,
    creativity: stats.creativity + statBonus,
    reliability: stats.reliability + statBonus,
    speed: stats.speed + statBonus,
    leadership: stats.leadership + statBonus
  };
}

// Get newly unlocked skills for a level
function getUnlockedSkillsForLevel(level: number, agentClass: string): string[] {
  const unlockedSkills: string[] = [];
  
  // Universal skills unlocked at certain levels
  if (level === 5) unlockedSkills.push('Advanced Analysis');
  if (level === 10) unlockedSkills.push('Master Coordination');
  if (level === 15) unlockedSkills.push('Expert Optimization');
  if (level === 20) unlockedSkills.push('Legendary Insight');
  
  // Class-specific skills
  const classSkills: { [key: string]: { [level: number]: string } } = {
    'Code Master': {
      3: 'Refactoring Mastery',
      7: 'Architecture Vision',
      12: 'Performance Tuning',
      18: 'System Integration'
    },
    'Data Sage': {
      3: 'Pattern Recognition',
      7: 'Predictive Analysis',
      12: 'Data Synthesis',
      18: 'Knowledge Fusion'
    },
    'Creative Bard': {
      3: 'Narrative Weaving',
      7: 'Design Harmony',
      12: 'Innovation Spark',
      18: 'Creative Revolution'
    },
    'Rapid Scout': {
      3: 'Quick Navigation',
      7: 'Parallel Processing',
      12: 'Speed Optimization',
      18: 'Instant Deployment'
    }
  };
  
  const classSpecificSkills = classSkills[agentClass];
  if (classSpecificSkills && classSpecificSkills[level]) {
    unlockedSkills.push(classSpecificSkills[level]);
  }
  
  return unlockedSkills;
}

// Calculate team XP distribution
export function distributeTeamXp(
  totalXp: number,
  agents: Agent[],
  contributionWeights?: { [agentId: number]: number }
): { [agentId: number]: number } {
  const distribution: { [agentId: number]: number } = {};
  
  if (!contributionWeights) {
    // Equal distribution
    const xpPerAgent = Math.floor(totalXp / agents.length);
    agents.forEach(agent => {
      distribution[agent.id] = xpPerAgent;
    });
  } else {
    // Weighted distribution
    const totalWeight = Object.values(contributionWeights).reduce((sum, weight) => sum + weight, 0);
    agents.forEach(agent => {
      const weight = contributionWeights[agent.id] || 1;
      distribution[agent.id] = Math.floor(totalXp * (weight / totalWeight));
    });
  }
  
  return distribution;
}

// XP decay for inactive agents
export function calculateXpDecay(
  lastActivityDate: Date,
  currentDate: Date = new Date()
): number {
  const daysSinceActivity = (currentDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceActivity <= 7) return 0; // No decay for first week
  if (daysSinceActivity <= 14) return 0.05; // 5% decay for second week
  if (daysSinceActivity <= 30) return 0.1; // 10% decay for first month
  if (daysSinceActivity <= 60) return 0.2; // 20% decay for second month
  return 0.3; // 30% max decay
}

export default {
  calculateXpToNextLevel,
  calculateTotalXpForLevel,
  calculateLevelFromXp,
  calculateQuestXpReward,
  calculatePartialQuestXp,
  calculateStreakBonus,
  calculateSkillXp,
  calculateCollaborationXp,
  calculateKnowledgeXp,
  applyXpToAgent,
  distributeTeamXp,
  calculateXpDecay
};