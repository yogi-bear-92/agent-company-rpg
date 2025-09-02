import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Brain, Users, Star, Trophy, Target, Settings, Plus, Play, ChevronDown, ChevronRight, Heart, Swords, BookOpen, Wrench, BarChart3, Activity, TrendingUp, Network, Cpu, Database, GitBranch, Globe, Search, Bookmark, Share2, MessageCircle, Wifi, WifiOff } from 'lucide-react';

const AgentCompanyRPG = () => {
  const [activeTab, setActiveTab] = useState('guild');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [expandedSkillTrees, setExpandedSkillTrees] = useState({});
  const [knowledgeConnected, setKnowledgeConnected] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  
  // Enhanced agents with real knowledge integration
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "CodeMaster Zyx",
      class: "Code Warrior",
      level: 15,
      xp: 3840,
      xpToNext: 4200,
      stats: { intelligence: 88, creativity: 65, reliability: 92, speed: 78, leadership: 75 },
      specializations: ["Python", "JavaScript", "System Architecture", "API Design"],
      currentMission: "Learning FastAPI Advanced Patterns",
      personality: "Methodical and precise",
      avatar: "⚔️",
      knowledgeBase: {
        totalMemories: 247,
        recentLearning: "FastAPI dependency injection patterns",
        knowledgeDomains: {
          "web_development": 89,
          "system_design": 85,
          "database_optimization": 78
        },
        crawlingProgress: {
          active: true,
          currentUrl: "https://fastapi.tiangolo.com/advanced/",
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
        "Architecture Vision": { level: 6, maxLevel: 10, unlocked: true, recentProgress: "+0.5 from system design articles" }
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
      currentMission: "Exploring Scikit-learn Advanced Techniques",
      personality: "Thoughtful and thorough",
      avatar: "🧙‍♀️",
      knowledgeBase: {
        totalMemories: 312,
        recentLearning: "Advanced ensemble methods in ML",
        knowledgeDomains: {
          "machine_learning": 94,
          "statistics": 91,
          "data_analysis": 87
        },
        crawlingProgress: {
          active: true,
          currentUrl: "https://scikit-learn.org/stable/modules/ensemble.html",
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
        "Wisdom Sharing": { level: 4, maxLevel: 10, unlocked: true, recentProgress: "+0.2 from mentoring" }
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
      currentMission: "Learning Advanced Copywriting Techniques",
      personality: "Imaginative and expressive",
      avatar: "🎭",
      knowledgeBase: {
        totalMemories: 189,
        recentLearning: "Persuasive writing frameworks and techniques",
        knowledgeDomains: {
          "creative_writing": 93,
          "marketing": 79,
          "psychology": 71
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
        "Emotional Resonance": { level: 3, maxLevel: 10, unlocked: true, recentProgress: "+0.4 from psychology insights" }
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
      currentMission: "Available - Ready for Knowledge Gathering",
      personality: "Quick and adaptable",
      avatar: "🏃‍♂️",
      knowledgeBase: {
        totalMemories: 156,
        recentLearning: "Advanced search operators and research methodologies",
        knowledgeDomains: {
          "research_methods": 87,
          "competitive_analysis": 82,
          "trend_identification": 79
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
        "Trend Prediction": { level: 2, maxLevel: 10, unlocked: true, recentProgress: "+0.1 from data analysis" }
      },
      realtimeActivity: [
        { timestamp: "6 mins ago", action: "Received knowledge from CodeMaster", relationship: "Mentorship +3%" },
        { timestamp: "18 mins ago", action: "Completed research methodology course", xpGained: 22 },
        { timestamp: "25 mins ago", action: "Started trend analysis project", missionStart: true }
      ]
    }
  ]);

  const [guildStats] = useState({
    totalAgents: 4,
    activeAgents: 3,
    completedMissions: 47,
    totalXP: 8960,
    guildLevel: 12,
    knowledgeNetworkHealth: 94,
    totalKnowledgeItems: 904,
    realtimeLearning: true,
    collaborativeSessions: 23
  });

  const [knowledgeNetwork] = useState({
    totalNodes: 904,
    connections: 2341,
    recentGrowth: "+47 items today",
    topDomains: [
      { name: "Web Development", items: 234, growth: "+12" },
      { name: "Machine Learning", items: 189, growth: "+8" },
      { name: "System Design", items: 156, growth: "+15" },
      { name: "Creative Writing", items: 123, growth: "+7" }
    ],
    recentActivity: [
      { agent: "CodeMaster Zyx", action: "Learned FastAPI middleware patterns", timeAgo: "2m" },
      { agent: "Sage Analytica", action: "Discovered ensemble optimization", timeAgo: "1m" },
      { agent: "Bard Creative", action: "Mastered persuasion frameworks", timeAgo: "3m" },
      { agent: "Scout Rapid", action: "Analyzed research methodologies", timeAgo: "6m" }
    ]
  });

  const [activeQuests] = useState([
    { 
      id: 1, 
      title: "Master Advanced FastAPI Patterns", 
      difficulty: "Hard", 
      xpReward: 180, 
      assignedTo: "CodeMaster Zyx", 
      progress: 75,
      knowledgeSource: "https://fastapi.tiangolo.com/advanced/",
      estimatedCompletion: "2h 15m"
    },
    { 
      id: 2, 
      title: "Learn Ensemble ML Techniques", 
      difficulty: "Expert", 
      xpReward: 220, 
      assignedTo: "Sage Analytica", 
      progress: 60,
      knowledgeSource: "https://scikit-learn.org/stable/modules/ensemble.html",
      estimatedCompletion: "3h 30m"
    },
    { 
      id: 3, 
      title: "Research Competitor Content Strategies", 
      difficulty: "Medium", 
      xpReward: 120, 
      assignedTo: "Unassigned", 
      progress: 0,
      knowledgeSource: "Multiple marketing blogs",
      estimatedCompletion: "1h 45m"
    }
  ]);

  // Real-time knowledge updates simulation
  useEffect(() => {
    if (knowledgeConnected) {
      const interval = setInterval(() => {
        const updates = [
          "CodeMaster Zyx gained +15 XP from FastAPI learning",
          "Sage Analytica discovered new ML optimization technique",
          "Knowledge sharing session started between 3 agents",
          "Bard Creative unlocked new creative writing skill",
          "Scout Rapid completed competitive analysis research"
        ];
        
        setRealtimeUpdates(prev => [
          `${new Date().toLocaleTimeString()}: ${updates[Math.floor(Math.random() * updates.length)]}`,
          ...prev.slice(0, 4)
        ]);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [knowledgeConnected]);

  const getStatColor = (value) => {
    if (value >= 90) return 'text-purple-400';
    if (value >= 75) return 'text-blue-400';
    if (value >= 60) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'Hard': return 'text-red-400 bg-red-900/20';
      case 'Expert': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const renderGuildHall = () => (
    <div className="space-y-6">
      {/* Enhanced Guild Stats with Knowledge Network */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-slate-400 text-sm">Active Agents</p>
              <p className="text-2xl font-bold">{guildStats.activeAgents}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Knowledge Items</p>
              <p className="text-2xl font-bold">{guildStats.totalKnowledgeItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Network Health</p>
              <p className="text-2xl font-bold text-green-400">{guildStats.knowledgeNetworkHealth}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Collab Sessions</p>
              <p className="text-2xl font-bold">{guildStats.collaborativeSessions}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Guild Level</p>
              <p className="text-2xl font-bold">{guildStats.guildLevel}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            {knowledgeConnected ? <Wifi className="w-8 h-8 text-green-400" /> : <WifiOff className="w-8 h-8 text-red-400" />}
            <div>
              <p className="text-slate-400 text-sm">Real-time Sync</p>
              <p className={`text-sm font-bold ${knowledgeConnected ? 'text-green-400' : 'text-red-400'}`}>
                {knowledgeConnected ? 'CONNECTED' : 'OFFLINE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Agent Roster with Knowledge Integration */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  Intelligent Agent Roster
                </h2>
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Recruit Agent
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors cursor-pointer"
                       onClick={() => setSelectedAgent(agent)}>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{agent.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{agent.name}</h3>
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full">{agent.class}</span>
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">Level {agent.level}</span>
                          {agent.knowledgeBase.crawlingProgress.active && (
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full animate-pulse">
                              🌐 LEARNING
                            </span>
                          )}
                        </div>
                        
                        {/* XP Bar with Knowledge Boost */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-slate-400 mb-1">
                            <span>XP: {agent.xp} (+{agent.knowledgeBase.knowledgeGained || 0} from learning)</span>
                            <span>Next Level: {agent.xpToNext}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(agent.xp / agent.xpToNext) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getStatColor(agent.stats.intelligence)}`}>{agent.stats.intelligence}</div>
                            <div className="text-xs text-slate-400">INT</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getStatColor(agent.stats.creativity)}`}>{agent.stats.creativity}</div>
                            <div className="text-xs text-slate-400">CRE</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getStatColor(agent.stats.reliability)}`}>{agent.stats.reliability}</div>
                            <div className="text-xs text-slate-400">REL</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getStatColor(agent.stats.speed)}`}>{agent.stats.speed}</div>
                            <div className="text-xs text-slate-400">SPD</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getStatColor(agent.stats.leadership)}`}>{agent.stats.leadership}</div>
                            <div className="text-xs text-slate-400">LDR</div>
                          </div>
                        </div>

                        {/* Knowledge Base Summary */}
                        <div className="mb-3 p-2 bg-slate-800/50 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-400">Knowledge Base</span>
                            <span className="text-sm text-cyan-400">{agent.knowledgeBase.totalMemories} memories</span>
                          </div>
                          <div className="text-xs text-slate-300 mb-2">
                            📚 {agent.knowledgeBase.recentLearning}
                          </div>
                          {agent.knowledgeBase.crawlingProgress.active && (
                            <div className="text-xs text-green-400">
                              🔄 Learning from: {agent.knowledgeBase.crawlingProgress.currentUrl?.split('/').slice(-2).join('/') || 'Multiple sources'}
                            </div>
                          )}
                        </div>

                        {/* Recent Activity */}
                        <div className="mb-3">
                          <div className="text-xs text-slate-400 mb-1">Recent Activity:</div>
                          <div className="space-y-1">
                            {agent.realtimeActivity.slice(0, 2).map((activity, idx) => (
                              <div key={idx} className="text-xs text-slate-300 flex justify-between">
                                <span>{activity.action}</span>
                                <span className="text-slate-500">{activity.timestamp}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Current Mission */}
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {agent.currentMission.includes("Available") ? (
                              <span className="text-green-400">Available for Mission</span>
                            ) : (
                              <span>🎯 {agent.currentMission}</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quest Board + Real-time Activity */}
        <div className="space-y-6">
          {/* Knowledge Quests */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Knowledge Quests
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {activeQuests.map(quest => (
                  <div key={quest.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{quest.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress: {quest.progress}%</span>
                        <span>+{quest.xpReward} XP</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${quest.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 mb-1">
                      📚 Source: {quest.knowledgeSource.includes('http') ? 
                        new URL(quest.knowledgeSource).hostname : 
                        quest.knowledgeSource}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className={quest.assignedTo === "Unassigned" ? "text-yellow-400" : "text-cyan-400"}>
                        {quest.assignedTo}
                      </span>
                      <span className="text-slate-500">⏱️ {quest.estimatedCompletion}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                <Search className="w-4 h-4 inline mr-2" />
                Generate New Learning Quest
              </button>
            </div>
          </div>

          {/* Real-time Knowledge Updates */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Live Knowledge Feed
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realtimeUpdates.map((update, idx) => (
                  <div key={idx} className="text-xs text-slate-300 p-2 bg-slate-900/30 rounded border-l-2 border-green-400/30">
                    {update}
                  </div>
                ))}
                {realtimeUpdates.length === 0 && (
                  <div className="text-slate-500 text-sm text-center py-4">
                    {knowledgeConnected ? "Waiting for real-time updates..." : "Knowledge sync offline"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Knowledge Network Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Knowledge Network
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{knowledgeNetwork.totalNodes}</div>
                  <div className="text-xs text-slate-400">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{knowledgeNetwork.connections}</div>
                  <div className="text-xs text-slate-400">Connections</div>
                </div>
              </div>
              
              <div className="text-sm text-green-400 text-center mb-4">
                {knowledgeNetwork.recentGrowth}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-300">Top Domains:</div>
                {knowledgeNetwork.topDomains.map(domain => (
                  <div key={domain.name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">{domain.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{domain.items}</span>
                      <span className="text-green-400">{domain.growth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Agent Company RPG
            </h1>
            <p className="text-slate-300 mt-2">
              Neural-Powered Agent Intelligence • Real Knowledge Integration • Live Learning
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Network Knowledge</p>
              <p className="text-2xl font-bold text-cyan-400">{guildStats.totalKnowledgeItems} items</p>
            </div>
            <button 
              onClick={() => setKnowledgeConnected(!knowledgeConnected)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors"
            >
              {knowledgeConnected ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              <span className="text-sm">{knowledgeConnected ? 'Connected' : 'Offline'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('guild')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'guild' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            🏰 Guild Hall
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'knowledge' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            🧠 Knowledge Network
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            📊 Neural Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      {renderGuildHall()}
    </div>
  );
};

export default AgentCompanyRPG;