import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const GameHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const GameDescription = styled.p`
  color: var(--text-secondary);
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const ActionCard = styled.div`
  background-color: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  ${props => props.disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const ActionTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const ActionDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const ScoreValue = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  border-radius: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'var(--secondary-color)'};
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? 'var(--primary-hover)' : '#0e9988'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FeedbackMessage = styled.div`
  padding: 1rem;
  text-align: center;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  
  ${props => props.type === 'success' && `
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
  `}
  
  ${props => props.type === 'error' && `
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--error-color);
  `}
`;

const CooldownIndicator = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const CooldownProgress = styled.div`
  height: 100%;
  background-color: var(--primary-color);
  width: ${props => props.progress}%;
  transition: width 1s linear;
`;

// Game actions configuration
const actions = [
  {
    id: 'COMPLETE_TASK',
    title: 'Complete Task',
    description: 'Complete a daily task to earn points',
    icon: '📝',
    scoreValue: 10,
    cooldown: 5, // seconds
    primary: true
  },
  {
    id: 'WIN_GAME',
    title: 'Win Game',
    description: 'Win a game against opponents',
    icon: '🏆',
    scoreValue: 50,
    cooldown: 15,
    primary: true
  },
  {
    id: 'DAILY_LOGIN',
    title: 'Daily Login',
    description: 'Get bonus points for daily login',
    icon: '📆',
    scoreValue: 5,
    cooldown: 20,
    primary: false
  },
  {
    id: 'SHARE_CONTENT',
    title: 'Share Content',
    description: 'Share content with friends',
    icon: '🔗',
    scoreValue: 15,
    cooldown: 10,
    primary: false
  },
];

function GamePage() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [performing, setPerforming] = useState({});
  
  const handleAction = async (actionType) => {
    // Don't allow if on cooldown
    if (cooldowns[actionType]) return;
    
    // Track action in progress
    setPerforming(prev => ({ ...prev, [actionType]: true }));
    
    try {
      // Record the action with the API
      const result = await api.recordAction(actionType);
      
      // Show success message
      setMessage({
        type: 'success',
        text: `You earned ${result.newScore - (result.newScore - actions.find(a => a.id === actionType).scoreValue)} points! Your new score is ${result.newScore}.`
      });
      
      // Set cooldown
      const action = actions.find(a => a.id === actionType);
      startCooldown(actionType, action.cooldown);
    } catch (error) {
      console.error('Error performing action:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to perform action'
      });
    } finally {
      // Clear action in progress
      setPerforming(prev => ({ ...prev, [actionType]: false }));
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };
  
  const startCooldown = (actionType, duration) => {
    // Set initial cooldown
    setCooldowns(prev => ({ 
      ...prev, 
      [actionType]: {
        remaining: duration,
        total: duration,
        progress: 0,
        timer: null
      }
    }));
    
    // Start countdown
    const intervalId = setInterval(() => {
      setCooldowns(prev => {
        const current = prev[actionType];
        
        if (!current) return prev;
        
        const remaining = current.remaining - 1;
        const progress = ((current.total - remaining) / current.total) * 100;
        
        if (remaining <= 0) {
          clearInterval(intervalId);
          const updated = { ...prev };
          delete updated[actionType];
          return updated;
        }
        
        return {
          ...prev,
          [actionType]: {
            ...current,
            remaining,
            progress
          }
        };
      });
    }, 1000);
    
    // Store timer ID for cleanup
    setCooldowns(prev => ({
      ...prev,
      [actionType]: {
        ...prev[actionType],
        timer: intervalId
      }
    }));
  };
  
  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      Object.values(cooldowns).forEach(cooldown => {
        if (cooldown.timer) {
          clearInterval(cooldown.timer);
        }
      });
    };
  }, [cooldowns]);
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Play to Earn Points</GameTitle>
        <GameDescription>
          Complete actions to earn points and climb the leaderboard!
        </GameDescription>
      </GameHeader>
      
      {message && (
        <FeedbackMessage type={message.type}>
          {message.text}
        </FeedbackMessage>
      )}
      
      <GameGrid>
        {actions.map(action => {
          const onCooldown = !!cooldowns[action.id];
          const isPerforming = !!performing[action.id];
          
          return (
            <ActionCard key={action.id} disabled={onCooldown || isPerforming}>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
              <ScoreValue>+{action.scoreValue} points</ScoreValue>
              
              <ActionButton
                primary={action.primary}
                disabled={onCooldown || isPerforming}
                onClick={() => handleAction(action.id)}
              >
                {isPerforming ? 'Processing...' : onCooldown ? `Cooldown ${cooldowns[action.id].remaining}s` : 'Perform Action'}
              </ActionButton>
              
              {onCooldown && (
                <CooldownIndicator>
                  <CooldownProgress progress={cooldowns[action.id].progress} />
                </CooldownIndicator>
              )}
            </ActionCard>
          );
        })}
      </GameGrid>
    </GameContainer>
  );
}

export default GamePage;