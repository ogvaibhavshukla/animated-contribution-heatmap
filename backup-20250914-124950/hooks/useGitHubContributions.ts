import { useState, useEffect, useCallback } from 'react';

export interface GitHubContributionsData {
  grid: number[][];
  startDate: string;
  endDate: string;
  totalContributions: number;
  username: string;
  weeks: any[];
}

export interface UseGitHubContributionsOptions {
  /** GitHub Personal Access Token */
  token?: string;
  /** GitHub username */
  username?: string;
  /** Start date for the calendar */
  startDate?: Date;
  /** End date for the calendar */
  endDate?: Date;
  /** Number of grid rows */
  gridRows?: number;
  /** Number of grid columns */
  gridCols?: number;
  /** Enable automatic refetching */
  autoFetch?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
}

export interface UseGitHubContributionsReturn {
  /** Contribution data */
  data: GitHubContributionsData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Clear error function */
  clearError: () => void;
}

/**
 * Custom hook for fetching GitHub contribution data
 */
export const useGitHubContributions = ({
  token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
  username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'octocat',
  startDate = new Date(new Date().getFullYear(), 0, 1),
  endDate = new Date(new Date().getFullYear(), 11, 31),
  gridRows = 7,
  gridCols = 53,
  autoFetch = true,
  refetchInterval = 0
}: UseGitHubContributionsOptions = {}): UseGitHubContributionsReturn => {
  const [data, setData] = useState<GitHubContributionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate date from grid position
  const calculateDateFromGridPosition = useCallback((row: number, col: number): Date => {
    const startWeekBegin = new Date(startDate);
    const daysFromSunday = startDate.getDay();
    startWeekBegin.setDate(startDate.getDate() - daysFromSunday);
    
    const targetDate = new Date(startWeekBegin);
    targetDate.setDate(startWeekBegin.getDate() + (col * 7) + row);
    
    return targetDate;
  }, [startDate]);

  // Fetch GitHub contributions
  const fetchContributions = useCallback(async () => {
    if (!token) {
      setError('GitHub token is required');
      return;
    }

    if (!username) {
      setError('GitHub username is required');
      return;
    }

    try {
      setLoading(true);
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
          'Authorization': `Bearer ${token}`,
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

      const contributionData: GitHubContributionsData = {
        grid,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalContributions: result.data.user.contributionsCollection.contributionCalendar.totalContributions,
        username,
        weeks
      };

      setData(contributionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, username, startDate, endDate, gridRows, gridCols, calculateDateFromGridPosition]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchContributions();
    }
  }, [autoFetch, fetchContributions]);

  // Auto refetch interval
  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(fetchContributions, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchContributions]);

  return {
    data,
    loading,
    error,
    refetch: fetchContributions,
    clearError
  };
};
