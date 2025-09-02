import { Agent } from '../types/agent';

export const initialAgents: Agent[] = [
  {
    id: 1,
    name: "CodeMaster Zyx",
    class: "Code Warrior",
    level: 15,
    xp: 3840,
    xpToNext: 4200,
    stats: { intelligence: 88, creativity: 65, reliability: 92, speed: 78, leadership: 75 },
    specializations: ["Python", "JavaScript", "System Architecture", "API Design"],
    currentMission: "Available for Mission",
    personality: "Methodical and precise",
    avatar: "⚔️",
    knowledgeBase: {
      totalMemories: 247,
      recentLearning: "FastAPI dependency injection patterns",
      knowledgeDomains: {
        "web_development": 89,
        "system_design": 85,
        "database_optimization": 78,
        "api_architecture": 92
      },
      crawlingProgress: {
        active: false,
        lastUrl: "https://fastapi.tiangolo.com/advanced/",
        pagesLearned: 12,
        knowledgeGained: 8.5
      }
    },
    equipment: {
      primary: "Advanced Code Analysis Engine v2.1",
      secondary: "Real-time Documentation Crawler",
      utility: "Knowledge Synthesis Matrix"
    },
    relationships: [
      { agentId: 4, type: "mentor", strength: 88, recentInteraction: "Shared API design patterns" },
      { agentId: 2, type: "colleague", strength: 75, recentInteraction: "Collaborated on database optimization" }
    ],
    skillTree: {
      "Combat Coding": { level: 9, maxLevel: 10, unlocked: true, recentProgress: "+0.3 from FastAPI learning" },
      "Debug Mastery": { level: 7, maxLevel: 10, unlocked: true, recentProgress: "+0.2 from error handling docs" },
      "Architecture Vision": { level: 6, maxLevel: 10, unlocked: true, recentProgress: "+0.5 from system design articles" },
      "API Crafting": { level: 8, maxLevel: 10, unlocked: true }
    },
    realtimeActivity: [
      { timestamp: "2 mins ago", action: "Learned about FastAPI middleware", xpGained: 15 },
      { timestamp: "5 mins ago", action: "Shared knowledge with Scout Rapid", synergy: "+3%" },
      { timestamp: "8 mins ago", action: "Discovered async patterns", confidence: "+0.1" }
    ]
  },
  {
    id: 2,
    name: "Sage Analytica",
    class: "Data Sage",
    level: 11,
    xp: 1890,
    xpToNext: 2100,
    stats: { intelligence: 97, creativity: 73, reliability: 88, speed: 62, leadership: 82 },
    specializations: ["Statistical Analysis", "Machine Learning", "Data Visualization", "Research Methods"],
    currentMission: "Available for Mission",
    personality: "Thoughtful and thorough",
    avatar: "🧙‍♀️",
    knowledgeBase: {
      totalMemories: 312,
      recentLearning: "Advanced ensemble methods in ML",
      knowledgeDomains: {
        "machine_learning": 94,
        "statistics": 91,
        "data_analysis": 87,
        "research_methods": 85
      },
      crawlingProgress: {
        active: false,
        lastUrl: "https://scikit-learn.org/stable/modules/ensemble.html",
        pagesLearned: 8,
        knowledgeGained: 12.3
      }
    },
    equipment: {
      primary: "Neural Pattern Recognition Array v3.0",
      secondary: "Statistical Significance Detector",
      utility: "Knowledge Graph Builder"
    },
    relationships: [
      { agentId: 1, type: "colleague", strength: 75, recentInteraction: "Analyzed code performance metrics" },
      { agentId: 3, type: "mentor", strength: 68, recentInteraction: "Taught visualization techniques" }
    ],
    skillTree: {
      "Deep Analysis": { level: 8, maxLevel: 10, unlocked: true, recentProgress: "+0.4 from ensemble learning" },
      "Insight Generation": { level: 6, maxLevel: 10, unlocked: true, recentProgress: "+0.3 from new algorithms" },
      "Wisdom Sharing": { level: 4, maxLevel: 10, unlocked: true, recentProgress: "+0.2 from mentoring" },
      "Pattern Recognition": { level: 7, maxLevel: 10, unlocked: true }
    },
    realtimeActivity: [
      { timestamp: "1 min ago", action: "Mastered random forest optimization", xpGained: 25 },
      { timestamp: "4 mins ago", action: "Updated knowledge from research paper", confidence: "+0.15" },
      { timestamp: "7 mins ago", action: "Collaborative learning session started", participants: 3 }
    ]
  },
  {
    id: 3,
    name: "Bard Creative",
    class: "Content Bard",
    level: 8,
    xp: 1340,
    xpToNext: 1600,
    stats: { intelligence: 78, creativity: 96, reliability: 74, speed: 83, leadership: 70 },
    specializations: ["Creative Writing", "Storytelling", "Brand Voice", "Content Strategy"],
    currentMission: "Available for Mission",
    personality: "Imaginative and expressive",
    avatar: "🎭",
    knowledgeBase: {
      totalMemories: 189,
      recentLearning: "Persuasive writing frameworks and techniques",
      knowledgeDomains: {
        "creative_writing": 93,
        "marketing": 79,
        "psychology": 71,
        "storytelling": 88
      },
      crawlingProgress: {
        active: false,
        lastUrl: "https://copyblogger.com/copywriting-101/",
        pagesLearned: 15,
        knowledgeGained: 9.7
      }
    },
    equipment: {
      primary: "Narrative Weaving Engine v2.5",
      secondary: "Emotional Resonance Amplifier",
      utility: "Creative Flow Catalyst"
    },
    relationships: [
      { agentId: 2, type: "apprentice", strength: 68, recentInteraction: "Learning data storytelling" }
    ],
    skillTree: {
      "Creative Mastery": { level: 7, maxLevel: 10, unlocked: true, recentProgress: "+0.3 from new frameworks" },
      "Narrative Weaving": { level: 5, maxLevel: 10, unlocked: true, recentProgress: "+0.2 from storytelling guides" },
      "Emotional Resonance": { level: 3, maxLevel: 10, unlocked: true, recentProgress: "+0.4 from psychology insights" },
      "Brand Voice": { level: 6, maxLevel: 10, unlocked: true }
    },
    realtimeActivity: [
      { timestamp: "3 mins ago", action: "Completed copywriting tutorial", xpGained: 18 },
      { timestamp: "12 mins ago", action: "Received mentorship from Sage", relationship: "+2 strength" },
      { timestamp: "15 mins ago", action: "Discovered persuasion techniques", skillBoost: "Emotional Resonance +0.2" }
    ]
  },
  {
    id: 4,
    name: "Scout Rapid",
    class: "Research Scout",
    level: 6,
    xp: 890,
    xpToNext: 1200,
    stats: { intelligence: 74, creativity: 65, reliability: 79, speed: 94, leadership: 52 },
    specializations: ["Web Research", "Information Gathering", "Trend Analysis", "Competitive Intelligence"],
    currentMission: "Available for Mission",
    personality: "Quick and adaptable",
    avatar: "🏃‍♂️",
    knowledgeBase: {
      totalMemories: 156,
      recentLearning: "Advanced search operators and research methodologies",
      knowledgeDomains: {
        "research_methods": 87,
        "competitive_analysis": 82,
        "trend_identification": 79,
        "information_gathering": 91
      },
      crawlingProgress: {
        active: false,
        lastUrl: "https://research.google.com/pubs/",
        pagesLearned: 23,
        knowledgeGained: 6.8
      }
    },
    equipment: {
      primary: "Quantum Information Harvester v1.8",
      secondary: "Pattern Recognition Scanner",
      utility: "Knowledge Velocity Booster"
    },
    relationships: [
      { agentId: 1, type: "apprentice", strength: 88, recentInteraction: "Learning system architecture from mentor" }
    ],
    skillTree: {
      "Swift Research": { level: 5, maxLevel: 10, unlocked: true, recentProgress: "+0.3 from methodology learning" },
      "Information Synthesis": { level: 3, maxLevel: 10, unlocked: true, recentProgress: "+0.2 from practice" },
      "Trend Prediction": { level: 2, maxLevel: 10, unlocked: true, recentProgress: "+0.1 from data analysis" },
      "Competitive Intelligence": { level: 4, maxLevel: 10, unlocked: true }
    },
    realtimeActivity: [
      { timestamp: "6 mins ago", action: "Received knowledge from CodeMaster", relationship: "Mentorship +3%" },
      { timestamp: "18 mins ago", action: "Completed research methodology course", xpGained: 22 },
      { timestamp: "25 mins ago", action: "Started trend analysis project", missionStart: true }
    ]
  }
];