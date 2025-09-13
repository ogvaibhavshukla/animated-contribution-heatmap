import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ContributionCalendar.css';

export interface ContributionCalendarProps {
  /** GitHub Personal Access Token */
  githubToken?: string;
  /** GitHub username to display */
  username?: string;
  /** Theme: 'light' or 'dark' */
  theme?: 'light' | 'dark';
  /** Start date for the calendar */
  startDate?: Date;
  /** End date for the calendar */
  endDate?: Date;
  /** Animation speed in milliseconds */
  animationSpeed?: number;
  /** Maximum animation cycles */
  maxGenerations?: number;
  /** Size of contribution squares in pixels */
  squareSize?: number;
  /** Gap between squares in pixels */
  gapSize?: number;
  /** Number of grid rows */
  gridRows?: number;
  /** Number of grid columns */
  gridCols?: number;
  /** Custom CSS class name */
  className?: string;
  /** Callback when animation starts */
  onAnimationStart?: (pattern: string) => void;
  /** Callback when animation stops */
  onAnimationStop?: () => void;
  /** Callback when data is loaded */
  onDataLoad?: (data: any) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface ContributionData {
  grid: number[][];
  startDate: string;
  endDate: string;
  totalContributions: number;
  username: string;
}

const ContributionCalendar: React.FC<ContributionCalendarProps> = ({
  githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
  username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'octocat',
  theme = 'dark',
  startDate = new Date(new Date().getFullYear(), 0, 1),
  endDate = new Date(new Date().getFullYear(), 11, 31),
  animationSpeed = 150,
  maxGenerations = 500,
  squareSize = 14,
  gapSize = 3,
  gridRows = 7,
  gridCols = 53,
  className = '',
  onAnimationStart,
  onAnimationStop,
  onDataLoad,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ContributionData | null>(null);

  // Pattern types
  const PATTERNS = {
    GAME_OF_LIFE: 'gameOfLife',
    RIPPLE: 'ripple',
    WAVE: 'wave',
    RAIN: 'rain',
    SPIRAL: 'spiral',
    NOISE: 'noise',
    RULE30: 'rule30'
  };

  // Pattern mapping for letters
  const animateLetterPatterns = [
    PATTERNS.GAME_OF_LIFE, // A
    PATTERNS.NOISE,        // c
    PATTERNS.WAVE,         // t
    PATTERNS.SPIRAL,       // i
    PATTERNS.RULE30,       // v
    PATTERNS.RAIN,         // i
    PATTERNS.RIPPLE,       // t
    PATTERNS.GAME_OF_LIFE  // y
  ];

  // Fetch GitHub contributions
  const fetchGithubContributions = useCallback(async () => {
    if (!githubToken) {
      setError('GitHub token is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { login: username }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
        throw new Error('User not found or no contribution data available');
      }

      const weeks = result.data.user.contributionsCollection.contributionCalendar.weeks;
      const grid: number[][] = [];
      
      // Initialize grid
      for (let row = 0; row < gridRows; row++) {
        grid[row] = new Array(gridCols).fill(0);
      }
      
      // Create a map of dates to contributions from GitHub data
      const dateContributionMap = new Map();
      weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          dateContributionMap.set(day.date, day.contributionCount);
        });
      });
      
      // Fill grid based on custom date range
      for (let col = 0; col < gridCols; col++) {
        for (let row = 0; row < gridRows; row++) {
          const targetDate = calculateDateFromGridPosition(row, col);
          const dateStr = targetDate.toISOString().split('T')[0];
          const contributionCount = dateContributionMap.get(dateStr) || 0;
          grid[row][col] = contributionCount;
        }
      }

      const contributionData: ContributionData = {
        grid,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalContributions: result.data.user.contributionsCollection.contributionCalendar.totalContributions,
        username
      };

      setData(contributionData);
      onDataLoad?.(contributionData);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
    }
  }, [githubToken, username, startDate, endDate, gridRows, gridCols, onDataLoad, onError]);

  // Calculate date from grid position
  const calculateDateFromGridPosition = (row: number, col: number): Date => {
    const startWeekBegin = new Date(startDate);
    const daysFromSunday = startDate.getDay();
    startWeekBegin.setDate(startDate.getDate() - daysFromSunday);
    
    const targetDate = new Date(startWeekBegin);
    targetDate.setDate(startWeekBegin.getDate() + (col * 7) + row);
    
    return targetDate;
  };

  // Get date string for tooltip
  const getDateForGridPosition = (row: number, col: number): string => {
    const targetDate = calculateDateFromGridPosition(row, col);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = months[targetDate.getMonth()];
    const day = targetDate.getDate();
    const dayWithSuffix = addOrdinalSuffix(day);
    
    return `${month} ${dayWithSuffix}`;
  };

  // Add ordinal suffix to day
  const addOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return day + 'th';
    }
    switch (day % 10) {
      case 1: return day + 'st';
      case 2: return day + 'nd';
      case 3: return day + 'rd';
      default: return day + 'th';
    }
  };

  // Handle letter click for animations
  const handleLetterClick = (index: number) => {
    const pattern = animateLetterPatterns[index];
    onAnimationStart?.(pattern);
    // Animation logic would be implemented here
    // For now, just trigger the callback
  };

  // Initialize calendar
  useEffect(() => {
    fetchGithubContributions();
  }, [fetchGithubContributions]);

  if (isLoading) {
    return (
      <div className={`contribution-calendar-container ${theme} ${className}`}>
        <div className="cc-loading">
          <div className="cc-spinner"></div>
          <p>Loading contribution data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`contribution-calendar-container ${theme} ${className}`}>
        <div className="cc-error">
          <p>❌ {error}</p>
          <button onClick={fetchGithubContributions} className="cc-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`contribution-calendar-container ${theme} ${className}`}
      style={{
        '--cc-square-size': `${squareSize}px`,
        '--cc-gap-size': `${gapSize}px`
      } as React.CSSProperties}
    >
      <div className="cc-header">
        <h1 className="cc-title">
          {['A', 'c', 't', 'i', 'v', 'i', 't', 'y'].map((letter, index) => (
            <span
              key={index}
              className="cc-letter"
              data-pattern={animateLetterPatterns[index]}
              data-index={index}
              onClick={() => handleLetterClick(index)}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
      
      <div className="cc-calendar-container">
        <div className="cc-grid-container">
          {Array.from({ length: gridCols }, (_, col) => (
            <div key={col} className="cc-column">
              {Array.from({ length: gridRows }, (_, row) => {
                const value = data.grid[row][col];
                const dateString = getDateForGridPosition(row, col);
                
                let level = 0;
                if (value > 0) {
                  if (value > 10) level = 4;
                  else if (value > 5) level = 3;
                  else if (value > 2) level = 2;
                  else level = 1;
                }
                
                const contributionText = value === 1 ? 'contribution' : 'contributions';
                const tooltip = value > 0 
                  ? `${value} ${contributionText} on ${dateString}`
                  : `No contributions on ${dateString}`;
                
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`cc-square ${level > 0 ? `alive-${level}` : ''}`}
                    data-row={row}
                    data-col={col}
                    title={tooltip}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="cc-stats">
        <p>
          <strong>{data.totalContributions}</strong> contributions in the last year
        </p>
        <p>
          <strong>{data.username}</strong> on GitHub
        </p>
      </div>
    </div>
  );
};

export default ContributionCalendar;
