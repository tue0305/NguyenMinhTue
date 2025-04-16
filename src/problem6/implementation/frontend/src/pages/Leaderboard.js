import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import websocketService from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const LeaderboardTitle = styled.h1`
  font-size: 2rem;
  color: var(--text-primary);
`;

const UpdateInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const LeaderboardTable = styled.div`
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  padding: 1rem 1.5rem;
  background-color: var(--input-bg);
  font-weight: 600;
  color: var(--text-secondary);
  
  @media (min-width: 768px) {
    grid-template-columns: 80px 1fr 1fr 120px;
  }
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const LeaderboardRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--input-bg);
  }
  
  ${props => props.highlight && `
    animation: pulse 1s;
    background-color: rgba(99, 102, 241, 0.1);
  `}
  
  @media (min-width: 768px) {
    grid-template-columns: 80px 1fr 1fr 120px;
  }
`;

const Position = styled.div`
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(99, 102, 241, 0.1);
`;

const Username = styled.div`
  font-weight: 500;
`;

const Score = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  text-align: right;
`;

const ScoreChange = styled.div`
  font-size: 0.875rem;
  color: ${props => props.positive ? 'var(--success-color)' : 'var(--error-color)'};
  display: none;
  
  @media (min-width: 768px) {
    display: block;
    text-align: right;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
`;

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentChanges, setRecentChanges] = useState({});
  const { currentUser, isAuthenticated } = useAuth();
  
  // Load initial leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setLeaderboard(data.leaderboard);
        setLastUpdated(new Date(data.updatedAt));
        setError(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, []);
  
  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      websocketService.connect(token);
    }
    
    // Listen for leaderboard updates
    const leaderboardListener = websocketService.addListener('leaderboard_update', (data) => {
      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date());
    });
    
    // Listen for score updates
    const scoreListener = websocketService.addListener('score_update', (data) => {
      // Track recent score changes
      setRecentChanges(prev => ({
        ...prev,
        [data.userId]: {
          change: data.change,
          timestamp: Date.now()
        }
      }));
      
      // If not in top 10, we'll get a full leaderboard update if needed
    });
    
    // Clean up listeners on unmount
    return () => {
      leaderboardListener();
      scoreListener();
      if (isAuthenticated) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated]);
  
  // Clear outdated score change highlights
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentChanges(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].timestamp > 5000) {
            delete updated[userId];
          }
        });
        
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (date) => {
    if (!date) return '';
    
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState>Loading leaderboard data...</EmptyState>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState>{error}</EmptyState>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <LeaderboardHeader>
        <LeaderboardTitle>Top Players</LeaderboardTitle>
        {lastUpdated && (
          <UpdateInfo>
            Last updated: {formatTime(lastUpdated)}
          </UpdateInfo>
        )}
      </LeaderboardHeader>
      
      <LeaderboardTable>
        <TableHeader>
          <div>Rank</div>
          <div>Player</div>
          <div>Score</div>
          <div className="hidden md:block">Recent</div>
        </TableHeader>
        <TableBody>
          {leaderboard.length > 0 ? (
            leaderboard.map(user => {
              const recentChange = recentChanges[user.userId];
              const highlight = recentChange && 
                Date.now() - recentChange.timestamp < 5000;
              
              return (
                <LeaderboardRow 
                  key={user.userId} 
                  highlight={highlight}
                >
                  <Position>{user.position}</Position>
                  <Username>
                    {user.username}
                    {currentUser && currentUser.username === user.username && (
                      <span> (You)</span>
                    )}
                  </Username>
                  <Score>{user.score.toLocaleString()}</Score>
                  <ScoreChange positive={recentChange && recentChange.change > 0}>
                    {recentChange ? (
                      recentChange.change > 0 
                        ? `+${recentChange.change}` 
                        : recentChange.change
                    ) : ''}
                  </ScoreChange>
                </LeaderboardRow>
              );
            })
          ) : (
            <EmptyState>No players on the leaderboard yet!</EmptyState>
          )}
        </TableBody>
      </LeaderboardTable>
    </div>
  );
}

export default Leaderboard;