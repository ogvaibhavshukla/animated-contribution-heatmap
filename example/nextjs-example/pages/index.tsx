import React from 'react';
import { ContributionCalendar, useGitHubContributions } from 'react-animated-github-contribution-calendar';

export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎨 React Animated GitHub Contribution Calendar</h1>
      <p>A beautiful, interactive contribution calendar with 8 animation patterns</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>🚀 Component Example</h2>
        <ContributionCalendar
          githubToken={process.env.NEXT_PUBLIC_GITHUB_TOKEN}
          username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
          theme="dark"
          onAnimationStart={(pattern) => console.log('Animation started:', pattern)}
          onDataLoad={(data) => console.log('Data loaded:', data)}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>🪝 Hook Example</h2>
        <HookExample />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>📖 Instructions</h2>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          borderLeft: '4px solid #007bff'
        }}>
          <h3>1. Set up Environment Variables</h3>
          <p>Create a <code>.env.local</code> file in your project root:</p>
          <pre style={{ 
            background: '#2d3748', 
            color: '#e2e8f0', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username`}
          </pre>
          
          <h3>2. Get Your GitHub Token</h3>
          <p>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings > Personal Access Tokens</a> and create a new token with "public_repo" permission.</p>
        </div>
      </div>
    </div>
  );
}

// Hook example component
function HookExample() {
  const { data, loading, error, refetch } = useGitHubContributions({
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    username: process.env.NEXT_PUBLIC_GITHUB_USERNAME,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '1rem'
        }}></div>
        Loading contribution data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>❌ {error}</p>
        <button 
          onClick={refetch}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '1rem', 
      borderRadius: '8px' 
    }}>
      <h3>📊 Contribution Statistics</h3>
      <p><strong>Username:</strong> {data.username}</p>
      <p><strong>Total Contributions:</strong> {data.totalContributions}</p>
      <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
      <button 
        onClick={refetch}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Refresh Data
      </button>
    </div>
  );
}
