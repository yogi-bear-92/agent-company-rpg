# Level Progression System Documentation

## Overview

The Level Progression System is a comprehensive feature for Agent Company RPG that provides:

- **Automated XP calculation** with class bonuses and multipliers
- **Visual level-up notifications** with smooth animations
- **Real-time progression tracking** with event management
- **Quest completion integration** with team performance bonuses
- **Skill unlocking system** with milestone rewards
- **Backward compatibility** with existing agent data

## Architecture

### Core Components

1. **levelProgression.ts** - Core progression mechanics and event management
2. **LevelUpNotification.tsx** - Visual notification components with animations
3. **useLevelProgression.ts** - React hooks for progression integration
4. **levelProgression.css** - Animation styles and visual effects

### Integration Points

- **XP Calculator** - Uses existing `xpCalculator.ts` functions
- **Agent Types** - Compatible with existing `Agent` interface
- **Quest System** - Integrates with quest completion flow
- **App.tsx** - Main application integration

## Features

### XP Calculation
- **Base XP**: 100 XP to level 1→2, exponential scaling (1.5x multiplier)
- **Class bonuses**: Different multipliers for different agent classes
- **Quest difficulty**: Tutorial (0.5x) to Legendary (5x) multipliers
- **Time bonuses**: Up to 50% bonus for fast completion
- **Team synergy**: Up to 25% bonus for multi-agent quests
- **Optional objectives**: Additional XP for bonus completions

### Level-Up System
- **Stat bonuses**: Automatic stat increases every 5 levels
- **Skill unlocks**: Class-specific skills at levels 3, 7, 12, 18
- **Universal milestones**: Special skills at levels 5, 10, 15, 20
- **Visual feedback**: Animated notifications and celebrations

### Event Management
- **Real-time tracking**: All progression events are tracked
- **Notification queue**: Multiple notifications with priority system
- **Event handlers**: Customizable callbacks for different events
- **State persistence**: Events stored for 24-hour history

## Usage Examples

### Basic XP Award
```typescript
import { useLevelProgression } from './hooks/useLevelProgression';

const progression = useLevelProgression();

// Award XP to an agent
const updatedAgent = await progression.awardXp(agent, 150, "Quest completion");
```

### Quest Completion
```typescript
// Complete quest with full progression tracking
const updatedAgents = await progression.completeQuest(
  quest,
  assignedAgents,
  {
    completionTime: 45, // minutes
    optionalObjectivesCompleted: 2,
    teamPerformanceBonus: 1.2
  }
);
```

### Event Handling
```typescript
// Listen for level-up events
progression.onLevelUp((event) => {
  console.log(`${event.agentId} reached level ${event.newLevel}!`);
  // Trigger custom celebrations
});

// Listen for skill unlocks
progression.onSkillUnlock((event) => {
  console.log(`New skill unlocked: ${event.data.skill}`);
});
```

### Visual Effects
```typescript
// Manual level-up effect
progression.playLevelUpEffect(agentId);

// Preview XP effects
const preview = progression.calculatePreviewXp(agent, 200);
console.log(`Would reach level ${preview.newLevel}`);
```

## Component Usage

### Level-Up Modal
```tsx
{currentLevelUpEvent && (
  <LevelUpNotification
    agent={agent}
    levelUpEvent={currentLevelUpEvent}
    onClose={() => setCurrentLevelUpEvent(null)}
    autoClose={true}
    duration={5000}
  />
)}
```

### Notification Toasts
```tsx
<NotificationContainer 
  notifications={progression.activeNotifications}
  onDismiss={progression.dismissNotification}
/>
```

## Animation System

### CSS Classes
- `.level-up-glow` - Agent card glow effect
- `.xp-bar-animated` - Animated XP progress bar
- `.notification-toast` - Slide-in notification animation
- `.skill-unlock` - Bounce-in effect for new skills
- `.stat-boost` - Stat increase animation

### Visual Effects
- **Screen flash** on level-up
- **Particle effects** with golden sparkles
- **Agent highlighting** with rainbow borders
- **Progress bar animations** with shimmer effects

## Integration Guide

### 1. Import Dependencies
```typescript
import { useLevelProgression } from './hooks/useLevelProgression';
import { LevelUpNotification, NotificationContainer } from './components/LevelUpNotification';
import './styles/levelProgression.css';
```

### 2. Initialize Hook
```typescript
const progression = useLevelProgression();
```

### 3. Handle Quest Completion
```typescript
const handleQuestComplete = async (questId: string) => {
  const updatedAgents = await progression.completeQuest(quest, agents, {
    completionTime: actualTime,
    optionalObjectivesCompleted: bonusCount,
    teamPerformanceBonus: performanceMultiplier
  });
  
  setAgents(updatedAgents);
};
```

### 4. Add Visual Components
```tsx
{/* Notifications */}
<NotificationContainer 
  notifications={progression.activeNotifications}
  onDismiss={progression.dismissNotification}
/>

{/* Level-up modal */}
{levelUpEvent && (
  <LevelUpNotification
    agent={agent}
    levelUpEvent={levelUpEvent}
    onClose={handleCloseLevelUp}
  />
)}
```

### 5. Agent Card Integration
```tsx
<div 
  data-agent-id={agent.id}
  className="agent-card transition-all duration-300"
>
  {/* Agent content */}
</div>
```

## Configuration

### Level Scaling
```typescript
const BASE_XP_TO_NEXT_LEVEL = 100;
const LEVEL_XP_MULTIPLIER = 1.5;
```

### Class Bonuses
```typescript
const CLASS_XP_BONUSES = {
  'Code Master': { Investigation: 1.2, Creation: 1.3 },
  'Data Sage': { Investigation: 1.3, Exploration: 1.2 },
  // ... more classes
};
```

### Notification Settings
```typescript
// Auto-dismiss notifications after duration
duration: 4000, // milliseconds

// Notification priorities
priority: 'low' | 'medium' | 'high'

// Max simultaneous notifications
maxNotifications: 5
```

## Performance Considerations

- **Event batching** - Multiple XP awards are batched together
- **Animation optimization** - Uses requestAnimationFrame for smooth effects
- **Memory management** - Automatic cleanup of old events and notifications
- **State persistence** - Efficient state updates with minimal re-renders

## Backward Compatibility

The system is designed to be fully backward compatible:

- **Existing agents** work without modification
- **Current XP values** are preserved and enhanced
- **Quest system** integrates seamlessly
- **UI components** can be added incrementally

## Troubleshooting

### Common Issues
1. **TypeScript errors** - Ensure all Quest interfaces match the expected format
2. **Animation glitches** - Check CSS import and Tailwind configuration
3. **Event not firing** - Verify hook initialization and event handler registration
4. **Level-up not showing** - Check modal state management and event processing

### Debug Mode
```typescript
// Enable detailed logging
progression.onXpGain((event) => console.log('XP:', event));
progression.onLevelUp((event) => console.log('Level up:', event));
```

## Future Enhancements

- **Achievement system** integration
- **Leaderboards** for agent progression
- **Prestige levels** beyond level 100
- **Custom skill trees** per agent class
- **Social features** for progression sharing
- **Analytics dashboard** for progression metrics

## Testing

The system includes comprehensive testing features:

- **Mock quest creation** for testing progression
- **XP preview calculations** for UI feedback
- **Event simulation** for debugging
- **Animation testing** with manual triggers

Run the development server and complete quests to see the level progression system in action!