// Quest data for Agent Company RPG
import { Quest } from '../types/quest';

export const initialQuests: Quest[] = [
  // Tutorial Quest
  {
    id: 'quest_001',
    title: 'Welcome to the Guild',
    description: 'Learn the basics of agent management and complete your first mission.',
    lore: 'Every great journey begins with a single step. The Guild Master awaits your arrival.',
    type: 'main',
    category: 'Training',
    difficulty: 'Tutorial',
    status: 'available',
    icon: '📚',
    
    objectives: [
      {
        id: 'obj_001_1',
        description: 'Report to the Guild Master',
        completed: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'obj_001_2',
        description: 'Assign an agent to a task',
        completed: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'obj_001_3',
        description: 'Complete your first knowledge crawl',
        completed: false,
        progress: 0,
        maxProgress: 1
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    
    requirements: {
      minLevel: 1
    },
    
    rewards: {
      xp: 100,
      gold: 50,
      items: ['Apprentice Badge'],
      unlocks: ['Basic Quests']
    },
    
    assignedAgents: [],
    recommendedTeamSize: 1,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: false
  },
  
  // Main Story Quest
  {
    id: 'quest_002',
    title: 'The Lost Algorithm',
    description: 'Investigate the mysterious disappearance of a critical optimization algorithm.',
    lore: 'Ancient code fragments have been discovered, pointing to a legendary algorithm that could revolutionize agent efficiency.',
    type: 'main',
    category: 'Investigation',
    difficulty: 'Medium',
    status: 'available',
    icon: '🔍',
    
    objectives: [
      {
        id: 'obj_002_1',
        description: 'Analyze the code fragments',
        completed: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'obj_002_2',
        description: 'Interview veteran agents about the algorithm',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_002_3',
        description: 'Search the archived repositories',
        completed: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'obj_002_4',
        description: 'Reconstruct the algorithm',
        completed: false,
        progress: 0,
        maxProgress: 1,
        optional: true
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    timeLimit: 120,
    
    requirements: {
      minLevel: 5,
      requiredClass: ['Code Analyst', 'Data Sage'],
      requiredSkills: [
        { skill: 'Code Analysis', level: 3 },
        { skill: 'Data Mining', level: 2 }
      ]
    },
    
    rewards: {
      xp: 500,
      gold: 200,
      items: ['Algorithm Fragment', 'Sage Robe'],
      skillPoints: 2,
      reputation: [{ faction: 'Code Keepers', amount: 50 }]
    },
    
    bonusRewards: {
      xp: 200,
      items: ['Complete Algorithm Scroll'],
      reputation: [{ faction: 'Code Keepers', amount: 25 }]
    },
    
    assignedAgents: [],
    recommendedTeamSize: 3,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: false,
    githubIssue: '#102',
    knowledgeRequired: ['Algorithms', 'Data Structures', 'Legacy Systems']
  },
  
  // Epic Raid Quest
  {
    id: 'quest_003',
    title: 'The Data Breach Crisis',
    description: 'A massive data breach threatens the entire network. Assemble your best team!',
    lore: 'Dark agents have infiltrated the core systems. Time is of the essence.',
    type: 'raid',
    category: 'Combat',
    difficulty: 'Expert',
    status: 'available',
    icon: '⚔️',
    
    objectives: [
      {
        id: 'obj_003_1',
        description: 'Identify breach points',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_003_2',
        description: 'Deploy security patches',
        completed: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'obj_003_3',
        description: 'Trace the attackers',
        completed: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'obj_003_4',
        description: 'Neutralize the threat',
        completed: false,
        progress: 0,
        maxProgress: 1
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    timeLimit: 60,
    
    requirements: {
      minLevel: 10,
      teamSize: { min: 4, max: 8 },
      requiredSkills: [
        { skill: 'Cybersecurity', level: 5 },
        { skill: 'Rapid Response', level: 4 }
      ]
    },
    
    rewards: {
      xp: 1500,
      gold: 1000,
      items: ['Elite Security Badge', 'Firewall Enhancement', 'Legendary Cipher'],
      skillPoints: 5,
      reputation: [
        { faction: 'Security Council', amount: 100 },
        { faction: 'Guild Alliance', amount: 75 }
      ],
      unlocks: ['Elite Raids', 'Security Specialization']
    },
    
    assignedAgents: [],
    recommendedTeamSize: 6,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: true,
    cooldownHours: 168, // Weekly raid
    swarmTaskId: 'swarm_raid_001'
  },
  
  // Daily Quest
  {
    id: 'quest_004',
    title: 'Documentation Patrol',
    description: 'Update and maintain project documentation.',
    type: 'daily',
    category: 'Creation',
    difficulty: 'Easy',
    status: 'available',
    icon: '📝',
    
    objectives: [
      {
        id: 'obj_004_1',
        description: 'Review existing documentation',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_004_2',
        description: 'Update outdated sections',
        completed: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'obj_004_3',
        description: 'Add new examples',
        completed: false,
        progress: 0,
        maxProgress: 2,
        optional: true
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    
    requirements: {
      minLevel: 2
    },
    
    rewards: {
      xp: 150,
      gold: 50,
      items: ['Documentation Token'],
      reputation: [{ faction: 'Scribes Guild', amount: 10 }]
    },
    
    bonusRewards: {
      xp: 50,
      items: ['Quality Seal']
    },
    
    assignedAgents: [],
    recommendedTeamSize: 1,
    autoAssign: true,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: true,
    cooldownHours: 24
  },
  
  // Side Quest - Exploration
  {
    id: 'quest_005',
    title: 'The Uncharted Repository',
    description: 'Explore a newly discovered open-source repository and catalog its treasures.',
    type: 'side',
    category: 'Exploration',
    difficulty: 'Medium',
    status: 'available',
    icon: '🗺️',
    
    objectives: [
      {
        id: 'obj_005_1',
        description: 'Clone and analyze the repository',
        completed: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'obj_005_2',
        description: 'Document useful functions',
        completed: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'obj_005_3',
        description: 'Test integration possibilities',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_005_4',
        description: 'Create a fork with improvements',
        completed: false,
        progress: 0,
        maxProgress: 1,
        optional: true
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    
    requirements: {
      minLevel: 4,
      requiredSkills: [
        { skill: 'Repository Navigation', level: 2 },
        { skill: 'Code Review', level: 3 }
      ]
    },
    
    rewards: {
      xp: 300,
      gold: 150,
      items: ['Explorer Badge', 'Repository Map'],
      skillPoints: 1
    },
    
    bonusRewards: {
      xp: 100,
      items: ['Fork Master Trophy'],
      reputation: [{ faction: 'Open Source Alliance', amount: 30 }]
    },
    
    assignedAgents: [],
    recommendedTeamSize: 2,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: false
  },
  
  // Epic Quest Chain
  {
    id: 'quest_006',
    title: 'The Architect\'s Legacy',
    description: 'Uncover the secrets of the legendary System Architect.',
    lore: 'Tales speak of an architect who designed the perfect system. Their knowledge could unlock unlimited potential.',
    type: 'epic',
    category: 'Investigation',
    difficulty: 'Legendary',
    status: 'locked',
    icon: '🏛️',
    
    objectives: [
      {
        id: 'obj_006_1',
        description: 'Gather the Five Sacred Design Patterns',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_006_2',
        description: 'Decipher the Architect\'s Code',
        completed: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'obj_006_3',
        description: 'Build the Ultimate System',
        completed: false,
        progress: 0,
        maxProgress: 1
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    
    requirements: {
      minLevel: 20,
      requiredClass: ['System Architect', 'Code Master'],
      requiredQuests: ['quest_002', 'quest_003'],
      requiredSkills: [
        { skill: 'System Design', level: 10 },
        { skill: 'Architecture Patterns', level: 10 }
      ]
    },
    
    rewards: {
      xp: 5000,
      gold: 5000,
      items: ['Architect\'s Crown', 'Legendary Blueprint', 'System Crystal'],
      skillPoints: 10,
      reputation: [
        { faction: 'Master Builders', amount: 500 },
        { faction: 'Guild Alliance', amount: 250 }
      ],
      unlocks: ['Master Architect Class', 'Legendary Quests']
    },
    
    assignedAgents: [],
    recommendedTeamSize: 8,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: false
  },
  
  // Training Quest
  {
    id: 'quest_007',
    title: 'Skill Advancement Trial',
    description: 'Push your agents to their limits in specialized training.',
    type: 'side',
    category: 'Training',
    difficulty: 'Hard',
    status: 'available',
    icon: '🎯',
    
    objectives: [
      {
        id: 'obj_007_1',
        description: 'Complete coding challenges',
        completed: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'obj_007_2',
        description: 'Optimize existing solutions',
        completed: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'obj_007_3',
        description: 'Mentor junior agents',
        completed: false,
        progress: 0,
        maxProgress: 3
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    timeLimit: 90,
    
    requirements: {
      minLevel: 8,
      teamSize: { min: 2, max: 4 }
    },
    
    rewards: {
      xp: 800,
      skillPoints: 3,
      items: ['Training Certificate', 'Skill Boost Elixir'],
      reputation: [{ faction: 'Training Academy', amount: 60 }]
    },
    
    assignedAgents: [],
    recommendedTeamSize: 3,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: true,
    cooldownHours: 72
  },
  
  // Diplomacy Quest
  {
    id: 'quest_008',
    title: 'The Alliance Summit',
    description: 'Negotiate partnerships with other agent guilds.',
    type: 'main',
    category: 'Diplomacy',
    difficulty: 'Medium',
    status: 'available',
    icon: '🤝',
    
    objectives: [
      {
        id: 'obj_008_1',
        description: 'Prepare presentation materials',
        completed: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'obj_008_2',
        description: 'Meet with guild representatives',
        completed: false,
        progress: 0,
        maxProgress: 4
      },
      {
        id: 'obj_008_3',
        description: 'Negotiate terms',
        completed: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'obj_008_4',
        description: 'Secure unanimous approval',
        completed: false,
        progress: 0,
        maxProgress: 1,
        optional: true
      }
    ],
    currentObjectiveIndex: 0,
    progressPercentage: 0,
    
    requirements: {
      minLevel: 6,
      requiredSkills: [
        { skill: 'Communication', level: 4 },
        { skill: 'Negotiation', level: 3 }
      ]
    },
    
    rewards: {
      xp: 600,
      gold: 400,
      items: ['Diplomat Badge', 'Alliance Token'],
      reputation: [
        { faction: 'Guild Alliance', amount: 100 },
        { faction: 'Diplomatic Corps', amount: 75 }
      ],
      unlocks: ['Alliance Quests', 'Trade Routes']
    },
    
    bonusRewards: {
      xp: 200,
      items: ['Master Negotiator Seal'],
      reputation: [{ faction: 'All Factions', amount: 25 }]
    },
    
    assignedAgents: [],
    recommendedTeamSize: 2,
    autoAssign: false,
    dialogue: [],
    
    createdAt: new Date(),
    repeatable: false
  }
];

// Quest chain data
export const questChains = [
  {
    id: 'chain_001',
    name: 'The Path to Mastery',
    description: 'Complete the journey from apprentice to master.',
    quests: ['quest_001', 'quest_004', 'quest_007', 'quest_006'],
    currentQuestIndex: 0,
    completed: false,
    finalReward: {
      xp: 10000,
      items: ['Master\'s Insignia', 'Legendary Skill Crystal'],
      skillPoints: 15,
      unlocks: ['Grandmaster Trials']
    }
  }
];

// Quest templates for dynamic generation
export const questTemplates = {
  daily: {
    xpRange: [100, 200],
    objectives: ['Review code', 'Fix bugs', 'Write tests', 'Update docs'],
    categories: ['Creation', 'Investigation', 'Training']
  },
  side: {
    xpRange: [200, 500],
    objectives: ['Explore repository', 'Analyze patterns', 'Implement feature', 'Optimize performance'],
    categories: ['Exploration', 'Creation', 'Combat']
  },
  main: {
    xpRange: [500, 1500],
    objectives: ['Investigate mystery', 'Gather evidence', 'Solve puzzle', 'Confront challenge'],
    categories: ['Investigation', 'Combat', 'Diplomacy']
  },
  raid: {
    xpRange: [1000, 3000],
    objectives: ['Prepare team', 'Execute strategy', 'Overcome obstacles', 'Achieve victory'],
    categories: ['Combat', 'Training']
  },
  epic: {
    xpRange: [3000, 10000],
    objectives: ['Uncover secrets', 'Master skills', 'Face trials', 'Claim destiny'],
    categories: ['Investigation', 'Training', 'Combat']
  }
};