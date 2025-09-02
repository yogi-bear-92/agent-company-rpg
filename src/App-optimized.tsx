import { Suspense, lazy } from 'react';
import { PerformanceProvider } from '../performance/integration/performance-provider';

// Lazy load components for better performance
const AgentSheet = lazy(() => import('./components/AgentSheet'));
const QuestBoard = lazy(() => import('./components/QuestBoard'));
const LevelUpNotification = lazy(() => import('./components/LevelUpNotification'));

// Loading component for Suspense
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Mock data for demonstration
const mockAgents = [
  {
    id: '1',
    name: 'Alice',
    level: 5,
    experiencePoints: 1250,
    health: 100,
    status: 'idle' as const,
    skills: [{ name: 'coding', level: 5, xp: 500 }],
    currentQuestId: null,
    completedQuests: [],
    efficiency: 1.2
  }
];

const mockLevelUpEvent = {
  agentId: '1',
  oldLevel: 4,
  newLevel: 5,
  skillsUnlocked: ['Advanced Coding'],
  statsIncreased: { intelligence: 2 },
  timestamp: Date.now()
};

function AppOptimized() {
  return (
    <PerformanceProvider enableInProduction={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Agent Company RPG
            </h1>
            <p className="text-slate-300">
              Manage your AI agents and complete quests to grow your company
            </p>
          </header>

          <Suspense fallback={<LoadingSpinner />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <AgentSheet agents={mockAgents} />
              </div>
              <div>
                <QuestBoard 
                  agents={mockAgents}
                  onQuestAssign={() => {}}
                  onQuestStart={() => {}}
                  onQuestComplete={() => {}}
                />
              </div>
            </div>
          </Suspense>

          <Suspense fallback={null}>
            <LevelUpNotification 
              agent={mockAgents[0]}
              levelUpEvent={mockLevelUpEvent}
              onClose={() => {}}
            />
          </Suspense>
        </div>
      </div>
    </PerformanceProvider>
  );
}

export default AppOptimized;