// Level up notification component with animations for Agent Company RPG

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Agent } from '../types/agent';
import { LevelUpEvent, ProgressionNotification } from '../utils/levelProgression';

interface LevelUpNotificationProps {
  agent: Agent;
  levelUpEvent: LevelUpEvent;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationToastProps {
  notification: ProgressionNotification;
  onDismiss: (id: string) => void;
  style?: React.CSSProperties;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  agent,
  levelUpEvent,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setAnimationPhase('exit');
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // Entrance animation
    const enterTimer = setTimeout(() => {
      setIsVisible(true);
      setAnimationPhase('celebrate');
    }, 100);

    // Celebration phase
    const celebrateTimer = setTimeout(() => {
      setShowDetails(true);
    }, 800);

    // Auto close
    let autoCloseTimer: NodeJS.Timeout;
    if (autoClose) {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(celebrateTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [autoClose, duration, handleClose]);

  const getAnimationClasses = () => {
    const baseClasses = "transform transition-all duration-500 ease-out";
    
    switch (animationPhase) {
      case 'enter':
        return `${baseClasses} scale-95 opacity-0 translate-y-4`;
      case 'celebrate':
        return `${baseClasses} scale-100 opacity-100 translate-y-0 ${
          isVisible ? 'animate-bounce' : ''
        }`;
      case 'exit':
        return `${baseClasses} scale-95 opacity-0 translate-y-2`;
      default:
        return baseClasses;
    }
  };

  const renderStatIncreases = () => {
    if (!levelUpEvent.statIncreases?.length) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-purple-300">Stat Increases:</h4>
        <div className="grid grid-cols-2 gap-2">
          {levelUpEvent.statIncreases.map((increase, index) => (
            <div 
              key={index}
              className="flex items-center space-x-2 bg-slate-700/50 rounded px-2 py-1"
            >
              <div className="text-xs font-medium capitalize">
                {increase.stat.replace(/([A-Z])/g, ' $1').trim()}:
              </div>
              <div className="text-green-400 font-bold text-xs">
                +{increase.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUnlockedSkills = () => {
    if (!levelUpEvent.unlockedSkills?.length) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-cyan-300">New Skills Unlocked:</h4>
        <div className="flex flex-wrap gap-2">
          {levelUpEvent.unlockedSkills.map((skill, index) => (
            <span 
              key={index}
              className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-3 py-1 text-xs font-medium text-cyan-300 animate-pulse"
            >
              ✨ {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        ref={notificationRef}
        className={`${getAnimationClasses()} relative max-w-md w-full mx-4`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl scale-110" />
        
        {/* Main notification */}
        <div className="relative bg-slate-900 bg-opacity-95 border border-purple-500 border-opacity-30 rounded-2xl p-6 shadow-2xl">
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Level Up!
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {agent.name} has reached level {levelUpEvent.newLevel}
            </p>
          </div>

          {/* Agent info */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-3xl">{agent.avatar}</div>
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-orange-400">
                  {levelUpEvent.oldLevel}
                </span>
                <span className="text-purple-400 animate-pulse">→</span>
                <span className="text-3xl font-bold text-yellow-400 animate-pulse">
                  {levelUpEvent.newLevel}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                +{levelUpEvent.xpGained} XP from {levelUpEvent.source}
              </div>
            </div>
          </div>

          {/* Progress bar animation */}
          <div className="mb-4">
            <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full transition-all duration-2000 ease-out animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Details section */}
          {showDetails && (
            <div className="space-y-3 animate-fade-in">
              {renderStatIncreases()}
              {renderUnlockedSkills()}
              
              {/* Action buttons */}
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                <button 
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all transform hover:scale-105"
                >
                  Awesome!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Particle effects */}
        {animationPhase === 'celebrate' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 1000}ms`,
                  animationDuration: '1500ms'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [onDismiss, notification.id]);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto dismiss after duration
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, handleDismiss]);

  const getTypeColors = () => {
    switch (notification.type) {
      case 'level_up':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 'skill_unlock':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30';
      case 'achievement':
        return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'stat_boost':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      default:
        return 'from-slate-500/20 to-gray-500/20 border-slate-400/30';
    }
  };

  const getPriorityIntensity = () => {
    switch (notification.priority) {
      case 'high':
        return 'animate-pulse';
      case 'medium':
        return '';
      case 'low':
        return 'opacity-80';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`transform transition-all duration-300 ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={style}
    >
      <div className={`bg-gradient-to-r ${getTypeColors()} backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm ${getPriorityIntensity()}`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {notification.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-300">
              {notification.message}
            </p>
            
            {/* Action buttons */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded px-2 py-1 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Container for multiple notifications
export const NotificationContainer: React.FC<{
  notifications: ProgressionNotification[];
  onDismiss: (id: string) => void;
}> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {notifications
        .filter(n => !n.dismissed)
        .slice(0, 5) // Show max 5 notifications
        .map((notification, index) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
            style={{
              transform: `translateY(${index * 4}px)`,
              zIndex: 40 - index
            }}
          />
        ))}
    </div>
  );
};

export default LevelUpNotification;