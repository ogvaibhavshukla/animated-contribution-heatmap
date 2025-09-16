/**
 * TypeScript type definitions for React Animated GitHub Contribution Calendar
 */

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
  onDataLoad?: (data: ContributionData) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface ContributionData {
  /** 2D grid of contribution counts */
  grid: number[][];
  /** Start date of the calendar */
  startDate: string;
  /** End date of the calendar */
  endDate: string;
  /** Total number of contributions */
  totalContributions: number;
  /** GitHub username */
  username: string;
}

export interface GitHubContributionsData extends ContributionData {
  /** Raw weeks data from GitHub API */
  weeks: GitHubWeek[];
}

export interface GitHubWeek {
  /** Array of contribution days in the week */
  contributionDays: GitHubContributionDay[];
}

export interface GitHubContributionDay {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of contributions on this day */
  contributionCount: number;
  /** Contribution level (0-4) */
  contributionLevel: number;
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

export interface GitHubAPIResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: GitHubWeek[];
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export type AnimationPattern = 
  | 'gameOfLife'
  | 'ripple'
  | 'wave'
  | 'rain'
  | 'spiral'
  | 'noise'
  | 'rule30'
  | 'image';

export type Theme = 'light' | 'dark';

export interface AnimationConfig {
  /** Animation speed in milliseconds */
  speed: number;
  /** Maximum animation cycles */
  maxGenerations: number;
  /** Current pattern */
  pattern: AnimationPattern;
  /** Whether animation is running */
  isRunning: boolean;
}

export interface GridConfig {
  /** Number of rows */
  rows: number;
  /** Number of columns */
  cols: number;
  /** Square size in pixels */
  squareSize: number;
  /** Gap between squares in pixels */
  gapSize: number;
}

export interface DateRange {
  /** Start date */
  start: Date;
  /** End date */
  end: Date;
}

// Environment variable types for Next.js
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_GITHUB_TOKEN?: string;
      NEXT_PUBLIC_GITHUB_USERNAME?: string;
      GITHUB_TOKEN?: string; // Server-side token
    }
  }
}
