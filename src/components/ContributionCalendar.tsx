import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './ContributionCalendar.css';
import { useAnimationPatterns, AnimationPattern } from '../hooks/useAnimationPatterns';

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
  onAnimationStart?: (pattern: AnimationPattern) => void;
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
  const [showRealData, setShowRealData] = useState(true);
  const letterClickDebounceRef = useRef<number | null>(null);

  // Animation hook
  const {
    grid: animationGrid,
    animationState,
    startAnimation,
    stopAnimation,
    changePattern,
    resetGrid,
    randomizeGrid
  } = useAnimationPatterns({
    rows: gridRows,
    cols: gridCols,
    animationSpeed,
    maxGenerations,
    onPatternChange: onAnimationStart,
    onAnimationStart,
    onAnimationStop
  });

  // Stable callback references to prevent infinite re-renders
  const onDataLoadRef = useRef(onDataLoad);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change - prevent infinite loops
  useEffect(() => {
    onDataLoadRef.current = onDataLoad;
    onErrorRef.current = onError;
  }, [onDataLoad, onError]);

  // Pattern mapping for letters (8 patterns for 8 letters in "Activity")
  const animateLetterPatterns: AnimationPattern[] = [
    'gameOfLife', // A
    'noise',      // c
    'wave',       // t
    'spiral',     // i
    'rule30',     // v
    'rain',       // i
    'ripple',     // t
    'gameOfLife'  // y (reuse Game of Life for 8th letter)
  ];

  // Pattern names for tooltips
  const patternNames: Record<AnimationPattern, string> = {
    gameOfLife: "Conway's Game of Life",
    ripple: "Circular Ripples",
    wave: "Wave Pattern",
    rain: "Rain Effect",
    spiral: "Spiral Pattern",
    noise: "Random Noise",
    rule30: "Rule 30 Automaton",
    image: "Image Pattern",
  };

  // CRITICAL: Add request throttling state
  const [isFetching, setIsFetching] = useState(false);
  const lastRequestTimeRef = useRef(0);

  // Fetch GitHub contributions - FIXED: Remove problematic dependencies
  const fetchGithubContributions = useCallback(async () => {
    const now = Date.now();
    
    // CRITICAL: Prevent multiple simultaneous requests
    if (isFetching) {
      console.log('THROTTLED: Request already in progress, skipping...');
      return;
    }
    
    // CRITICAL: Rate limiting protection (1 second minimum)
    if (now - lastRequestTimeRef.current < 1000) {
      console.log('THROTTLED: Request throttled to prevent rate limiting');
      return;
    }
    
    // CRITICAL: Validate required credentials
    if (!githubToken || !username) {
      if (onErrorRef.current) {
        onErrorRef.current(new Error('GitHub token and username are required'));
      }
      return;
    }

    setIsFetching(true);
    lastRequestTimeRef.current = now;

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error');
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
      
      // CRITICAL: Use ref callback to prevent dependency issues
      if (onDataLoadRef.current) {
        onDataLoadRef.current(contributionData);
      }
      
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      setError(errorMessage);
      
      // CRITICAL: Use ref callback for error handling
      if (onErrorRef.current) {
        onErrorRef.current(err instanceof Error ? err : new Error(errorMessage));
      }
      
      setIsLoading(false);
    } finally {
      setIsFetching(false);
    }
  }, [githubToken, username, startDate, endDate, gridRows, gridCols]);
  // CRITICAL NOTE: isLoading and lastRequestTime REMOVED from dependencies

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
    // 120ms debounce to prevent excessive rapid switches
    if (letterClickDebounceRef.current) {
      return;
    }
    letterClickDebounceRef.current = window.setTimeout(() => {
      if (letterClickDebounceRef.current) {
        window.clearTimeout(letterClickDebounceRef.current);
        letterClickDebounceRef.current = null;
      }
    }, 120);

    setShowRealData(false); // Switch to animation mode when clicking letters
    const newPattern = animateLetterPatterns[index];

    if (!animationState.isRunning) {
      // Start: save baseline and run
      startAnimation(newPattern, index);
      return;
    }

    if (animationState.activeLetterIndex === index) {
      // Pause: restore baseline grid (same letter clicked twice)
      stopAnimation();
      setShowRealData(true); // Auto-return to GitHub data
      return;
    }

    // Switch pattern while running
    changePattern(newPattern);
  };

  // CRITICAL: Initialize only once with proper dependency management
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // CRITICAL: Small delay prevents race conditions
      const timer = setTimeout(() => {
        fetchGithubContributions();
      }, 100);
      return () => clearTimeout(timer);
    }
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
              className={`cc-letter ${animationState.activeLetterIndex === index ? 'active' : ''}`}
              data-pattern={animateLetterPatterns[index]}
              data-index={index}
              onClick={() => handleLetterClick(index)}
              title={`Click to ${animationState.activeLetterIndex === index ? "pause & restore" : "start"} ${patternNames[animateLetterPatterns[index]]}`}
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
                // Use animation grid if not showing real data, otherwise use GitHub data
                const currentGrid = showRealData ? data.grid : animationGrid;
                const value = currentGrid[row][col];
                const dateString = getDateForGridPosition(row, col);
                
                let level = 0;
                if (value > 0) {
                  if (value > 10) level = 4;
                  else if (value > 5) level = 3;
                  else if (value > 2) level = 2;
                  else level = 1;
                }
                
                const contributionText = value === 1 ? 'contribution' : 'contributions';
                const tooltip = showRealData 
                  ? (value > 0 
                      ? `${value} ${contributionText} on ${dateString}`
                      : `No contributions on ${dateString}`)
                  : `Cell (${row}, ${col}): ${value > 0 ? `${value} contribution${value > 1 ? 's' : ''}` : "No contributions"}`;
                
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
        {!showRealData && (
          <div className="cc-animation-status">
            <p>
              <strong>Animation:</strong> {patternNames[animationState.currentPattern]} 
              {animationState.isRunning ? ` (Running - Gen ${animationState.generation})` : ' (Paused)'}
            </p>
            <div className="cc-controls">
              <button 
                onClick={randomizeGrid}
                className="cc-control-btn"
                disabled={animationState.isRunning}
              >
                Randomize
              </button>
              <button 
                onClick={resetGrid}
                className="cc-control-btn"
                disabled={animationState.isRunning}
              >
                Clear
              </button>
              <button 
                onClick={() => setShowRealData(true)}
                className="cc-control-btn"
              >
                Show Real Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionCalendar;
