/**
 * React Animated GitHub Contribution Calendar
 * Main export file
 */

// Main component
export { default as ContributionCalendar } from './components/ContributionCalendar';

// Custom hook
export { useGitHubContributions } from './hooks/useGitHubContributions';

// Types
export type {
  ContributionCalendarProps,
  ContributionData,
  GitHubContributionsData,
  GitHubWeek,
  GitHubContributionDay,
  UseGitHubContributionsOptions,
  UseGitHubContributionsReturn,
  GitHubAPIResponse,
  AnimationPattern,
  Theme,
  AnimationConfig,
  GridConfig,
  DateRange
} from './types';

// Default export
export { default } from './components/ContributionCalendar';
