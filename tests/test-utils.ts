import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    // Add any providers here if needed
    // wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const createMockAgent = (overrides = {}) => ({
  id: 1,
  name: 'Test Agent',
  class: 'Code Master',
  level: 5,
  xp: 450,
  xpToNext: 550,
  stats: {
    intelligence: 75,
    creativity: 65,
    reliability: 85,
    speed: 70,
    leadership: 60
  },
  specializations: ['Testing'],
  currentMission: 'Available',
  personality: 'Methodical',
  avatar: '🧪',
  knowledgeBase: {
    totalMemories: 100,
    recentLearning: 'Test concepts',
    knowledgeDomains: {},
    crawlingProgress: {
      active: false,
      lastUrl: '',
      pagesLearned: 0,
      knowledgeGained: 0
    }
  },
  equipment: {
    primary: 'Test Tool',
    secondary: 'Debug Kit',
    utility: 'Knowledge Base'
  },
  relationships: [],
  skillTree: {},
  realtimeActivity: [],
  ...overrides
})

export const createMockQuest = (overrides = {}) => ({
  id: 'test_quest',
  title: 'Test Quest',
  description: 'A quest for testing',
  type: 'main' as const,
  category: 'Investigation' as const,
  difficulty: 'Medium' as const,
  status: 'available' as const,
  icon: '🧪',
  objectives: [
    {
      id: '1',
      description: 'Test objective',
      completed: false,
      progress: 0,
      maxProgress: 1
    }
  ],
  currentObjectiveIndex: 0,
  progressPercentage: 0,
  requirements: { minLevel: 1 },
  rewards: { xp: 100, gold: 50, items: [] },
  assignedAgents: [],
  recommendedTeamSize: 1,
  autoAssign: false,
  dialogue: [],
  createdAt: new Date(),
  repeatable: false,
  ...overrides
})

// Mock functions for common hooks and utilities
export const mockUseLevelProgression = () => ({
  awardXp: vi.fn().mockResolvedValue(createMockAgent({ xp: 550 })),
  completeQuest: vi.fn().mockResolvedValue([createMockAgent({ xp: 600 })]),
  calculatePreviewXp: vi.fn(() => ({
    newLevel: 5,
    levelUp: false,
    xpProgress: 450,
    xpToNext: 550
  })),
  playLevelUpEffect: vi.fn(),
  activeNotifications: [],
  levelUpQueue: [],
  recentEvents: [],
  isProcessing: false,
  dismissNotification: vi.fn(),
  clearDismissedNotifications: vi.fn(),
  getNextLevelUp: vi.fn(),
  onLevelUp: vi.fn(),
  onXpGain: vi.fn(),
  onSkillUnlock: vi.fn()
})

// Performance testing utilities
export const measurePerformance = async <T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  const duration = end - start
  
  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`)
  }
  
  return { result, duration }
}

// Memory usage utilities
export const measureMemoryUsage = <T>(fn: () => T, label?: string): { result: T; memoryDelta: number } => {
  const initialMemory = process.memoryUsage().heapUsed
  const result = fn()
  const finalMemory = process.memoryUsage().heapUsed
  const memoryDelta = finalMemory - initialMemory
  
  if (label) {
    console.log(`${label} memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`)
  }
  
  return { result, memoryDelta }
}

// Test data generators
export const generateLargeAgentList = (count: number) =>
  Array(count).fill(null).map((_, i) => createMockAgent({
    id: i + 1,
    name: `Agent ${i + 1}`,
    level: (i % 20) + 1,
    xp: i * 100
  }))

export const generateLargeQuestList = (count: number) =>
  Array(count).fill(null).map((_, i) => createMockQuest({
    id: `quest_${i + 1}`,
    title: `Quest ${i + 1}`,
    difficulty: ['Easy', 'Medium', 'Hard', 'Expert', 'Legendary'][i % 5],
    rewards: { xp: (i + 1) * 50, gold: (i + 1) * 25, items: [] }
  }))

// Animation testing utilities
export const mockAnimationFrame = () => {
  let callbacks: (() => void)[] = []
  
  global.requestAnimationFrame = vi.fn((cb) => {
    callbacks.push(cb)
    return callbacks.length
  })
  
  global.cancelAnimationFrame = vi.fn((id) => {
    callbacks[id - 1] = () => {} // No-op
  })
  
  const flushAnimationFrames = () => {
    const toRun = [...callbacks]
    callbacks = []
    toRun.forEach(cb => cb())
  }
  
  return { flushAnimationFrames }
}

// DOM testing utilities
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Wait for condition helper
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const start = Date.now()
  
  while (!condition() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`)
  }
}