// Optimized XP calculation system with memoization and performance improvements
import { Agent, AgentStats } from '../../src/types/agent';
import { Quest } from '../../src/types/quest';

// Memoization cache for expensive calculations
const calculationCache = new Map<string, any>();
const CACHE_SIZE_LIMIT = 1000;

// Performance-optimized cache management
function setCache(key: string, value: unknown) {
  if (calculationCache.size >= CACHE_SIZE_LIMIT) {
    // Remove oldest 20% of entries
    const keysToDelete = Array.from(calculationCache.keys()).slice(0, Math.floor(CACHE_SIZE_LIMIT * 0.2));
    keysToDelete.forEach(k => calculationCache.delete(k));
  }
  calculationCache.set(key, value);
}

function getCache(key: string) {
  return calculationCache.get(key);
}

// Pre-computed level thresholds for performance
const LEVEL_THRESHOLDS = new Map<number, number>();
const BASE_XP_TO_NEXT_LEVEL = 100;
const LEVEL_XP_MULTIPLIER = 1.5;

// Pre-compute first 100 levels on module load
for (let level = 1; level <= 100; level++) {
  LEVEL_THRESHOLDS.set(level, Math.floor(BASE_XP_TO_NEXT_LEVEL * Math.pow(LEVEL_XP_MULTIPLIER, level - 1)));
}

// Optimized difficulty multipliers as a frozen object
const DIFFICULTY_MULTIPLIERS = {
  Tutorial: 0.5,
  Easy: 1.0,
  Medium: 1.5,
  Hard: 2.0,
  Expert: 3.0,
  Legendary: 5.0
} as const;

// Pre-computed class bonuses
const CLASS_XP_BONUSES = {
  'Code Master': { Investigation: 1.2, Creation: 1.3 },
  'Data Sage': { Investigation: 1.3, Exploration: 1.2 },
  'Creative Bard': { Creation: 1.3, Diplomacy: 1.2 },
  'Rapid Scout': { Exploration: 1.3, Combat: 1.2 },
  'System Architect': { Creation: 1.2, Training: 1.3 },
  'Bug Hunter': { Investigation: 1.3, Combat: 1.3 },
  'Documentation Wizard': { Creation: 1.2, Diplomacy: 1.3 }
} as const;

// Ultra-fast level threshold lookup
export function calculateXpToNextLevel(level: number): number {
  const cached = LEVEL_THRESHOLDS.get(level);
  if (cached !== undefined) return cached;
  
  // Fallback for levels > 100
  const result = Math.floor(BASE_XP_TO_NEXT_LEVEL * Math.pow(LEVEL_XP_MULTIPLIER, level - 1));
  LEVEL_THRESHOLDS.set(level, result);
  return result;
}

// Optimized total XP calculation with memoization
export function calculateTotalXpForLevel(targetLevel: number): number {
  const cacheKey = `totalXp_${targetLevel}`;
  const cached = getCache(cacheKey);
  if (cached !== undefined) return cached;
  
  let totalXp = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXp += calculateXpToNextLevel(level);
  }
  
  setCache(cacheKey, totalXp);
  return totalXp;
}

// Highly optimized level calculation using binary search
export function calculateLevelFromXp(totalXp: number): { level: number; currentLevelXp: number; xpToNext: number } {
  const cacheKey = `levelFromXp_${totalXp}`;
  const cached = getCache(cacheKey);
  if (cached !== undefined) return cached;
  
  // Binary search for level (much faster than linear)
  let low = 1, high = 100;
  let level = 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const xpRequired = calculateTotalXpForLevel(mid);
    
    if (totalXp >= xpRequired) {
      level = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  const currentLevelXp = totalXp - calculateTotalXpForLevel(level);
  const xpToNext = calculateXpToNextLevel(level);
  
  const result = { level, currentLevelXp, xpToNext };
  setCache(cacheKey, result);
  return result;
}

// Batch XP calculation for multiple agents
export function batchCalculateXpRewards(
  questAgentPairs: Array<{ quest: Quest; agent: Agent; completionData?: {
    completionTime?: number;
    optionalObjectivesCompleted?: number;
    teamPerformanceBonus?: number;
  } }>
): Array<{ agentId: number; xpReward: number; calculationTime: number }> {
  const startTime = performance.now();
  
  const results = questAgentPairs.map(({ quest, agent, completionData }) => {
    const calcStart = performance.now();
    const xpReward = calculateQuestXpRewardOptimized(quest, agent, completionData);
    const calcTime = performance.now() - calcStart;
    
    return {
      agentId: agent.id,
      xpReward,
      calculationTime: calcTime
    };
  });
  
  const totalTime = performance.now() - startTime;
  console.log(`Batch XP calculation completed in ${totalTime.toFixed(2)}ms for ${questAgentPairs.length} pairs`);
  
  return results;
}

// Optimized quest XP reward calculation
export function calculateQuestXpRewardOptimized(
  quest: Quest,
  agent: Agent,
  completionData?: {
    completionTime?: number;
    optionalObjectivesCompleted?: number;
    teamPerformanceBonus?: number;
  }
): number {
  const cacheKey = `questXp_${quest.id}_${agent.id}_${JSON.stringify(completionData)}`;
  const cached = getCache(cacheKey);
  if (cached !== undefined) return cached;
  
  let xpReward = quest.rewards.xp;
  
  // Optimized difficulty multiplier lookup
  xpReward *= DIFFICULTY_MULTIPLIERS[quest.difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] ?? 1.0;
  
  // Optimized class bonus lookup
  const classBonus = CLASS_XP_BONUSES[agent.class as keyof typeof CLASS_XP_BONUSES];
  if (classBonus) {
    const categoryBonus = classBonus[quest.category as keyof typeof classBonus];
    if (categoryBonus) {
      xpReward *= categoryBonus;
    }
  }
  
  // Time bonus calculations (if provided)
  if (completionData?.completionTime && quest.timeLimit) {
    const timeRatio = completionData.completionTime / quest.timeLimit;
    if (timeRatio < 0.5) {
      xpReward *= 1.5;
    } else if (timeRatio < 0.75) {
      xpReward *= 1.25;
    } else if (timeRatio < 1.0) {
      xpReward *= 1.1;
    }
  }
  
  // Optional objectives bonus
  if (completionData?.optionalObjectivesCompleted) {
    const totalOptional = quest.objectives.filter(obj => obj.optional).length;
    if (totalOptional > 0) {
      const optionalRatio = completionData.optionalObjectivesCompleted / totalOptional;
      xpReward += (quest.bonusRewards?.xp || 0) * optionalRatio;
    }
  }
  
  // Team synergy bonus
  if (quest.assignedAgents.length > 1) {
    const synergyBonus = 1 + (quest.assignedAgents.length - 1) * 0.05;
    xpReward *= Math.min(synergyBonus, 1.25);
  }
  
  // Team performance bonus
  if (completionData?.teamPerformanceBonus) {
    xpReward *= completionData.teamPerformanceBonus;
  }
  
  // Optimized streak bonus calculation
  const streakBonus = calculateStreakBonusOptimized(agent);
  xpReward *= streakBonus;
  
  const finalReward = Math.floor(xpReward);
  setCache(cacheKey, finalReward);
  return finalReward;
}

// Optimized streak calculation with caching
export function calculateStreakBonusOptimized(agent: Agent): number {
  const cacheKey = `streak_${agent.id}_${agent.realtimeActivity.length}`;
  const cached = getCache(cacheKey);
  if (cached !== undefined) return cached;
  
  // Count recent XP-gaining activities more efficiently
  let recentXpActivities = 0;
  for (let i = 0; i < Math.min(agent.realtimeActivity.length, 10); i++) {
    if (agent.realtimeActivity[i]?.xpGained && agent.realtimeActivity[i].xpGained! > 0) {
      recentXpActivities++;
    }
  }
  
  let bonus = 1.0;
  if (recentXpActivities >= 10) bonus = 1.3;
  else if (recentXpActivities >= 5) bonus = 1.15;
  else if (recentXpActivities >= 3) bonus = 1.05;
  
  setCache(cacheKey, bonus);
  return bonus;
}

// Batch level calculation for multiple agents
export function batchCalculateLevels(agents: Agent[]): Array<{
  agentId: number;
  level: number;
  currentLevelXp: number;
  xpToNext: number;
}> {
  return agents.map(agent => ({
    agentId: agent.id,
    ...calculateLevelFromXp(agent.xp)
  }));
}

// Optimized stat bonus application
export function applyLevelUpStatBonusOptimized(stats: AgentStats, newLevel: number): AgentStats {
  const cacheKey = `statBonus_${newLevel}`;
  const cached = getCache(cacheKey);
  
  let statBonus: number;
  if (cached !== undefined) {
    statBonus = cached;
  } else {
    statBonus = Math.floor(newLevel / 5) + 1;
    setCache(cacheKey, statBonus);
  }
  
  return {
    intelligence: stats.intelligence + statBonus,
    creativity: stats.creativity + statBonus,
    reliability: stats.reliability + statBonus,
    speed: stats.speed + statBonus,
    leadership: stats.leadership + statBonus
  };
}

// Batch XP application with minimal state changes
export function batchApplyXpToAgents(
  agents: Agent[],
  xpAwards: Array<{ agentId: number; amount: number; source: string }>
): Agent[] {
  const xpMap = new Map(xpAwards.map(award => [award.agentId, award]));
  
  return agents.map(agent => {
    const award = xpMap.get(agent.id);
    if (!award) return agent;
    
    const totalXp = agent.xp + award.amount;
    const levelData = calculateLevelFromXp(totalXp);
    const leveledUp = levelData.level > agent.level;
    
    return {
      ...agent,
      xp: levelData.currentLevelXp,
      xpToNext: levelData.xpToNext,
      level: levelData.level,
      stats: leveledUp ? applyLevelUpStatBonusOptimized(agent.stats, levelData.level) : agent.stats,
      realtimeActivity: [
        {
          timestamp: new Date().toISOString(),
          action: award.source,
          xpGained: award.amount
        },
        ...agent.realtimeActivity.slice(0, 49)
      ]
    };
  });
}

// Performance monitoring for XP calculations
export function measureXpCalculationPerformance() {
  return {
    cacheSize: calculationCache.size,
    cacheHitRate: getCacheHitRate(),
    averageCalculationTime: getAverageCalculationTime(),
    slowestCalculations: getSlowestCalculations()
  };
}

let cacheHits = 0;
let cacheMisses = 0;
const calculationTimes: number[] = [];

function getCacheHitRate(): number {
  const total = cacheHits + cacheMisses;
  return total > 0 ? (cacheHits / total) * 100 : 0;
}

function getAverageCalculationTime(): number {
  if (calculationTimes.length === 0) return 0;
  return calculationTimes.reduce((sum, time) => sum + time, 0) / calculationTimes.length;
}

function getSlowestCalculations(): number[] {
  return calculationTimes.sort((a, b) => b - a).slice(0, 5);
}

// Clear performance metrics
export function clearPerformanceMetrics() {
  calculationCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
  calculationTimes.length = 0;
}

// Optimized utility functions
export const optimizedUtils = {
  calculateXpToNextLevel,
  calculateTotalXpForLevel,
  calculateLevelFromXp,
  calculateQuestXpRewardOptimized,
  calculateStreakBonusOptimized,
  batchCalculateLevels,
  batchApplyXpToAgents,
  measureXpCalculationPerformance,
  clearPerformanceMetrics
};

export default optimizedUtils;