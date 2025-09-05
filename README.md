# 🎨 React Animated GitHub Contribution Calendar

A beautiful, animated GitHub contribution calendar React component designed specifically for Next.js and React applications. Features environment variable support, TypeScript definitions, and React hooks.

![Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=React+Animated+GitHub+Contribution+Calendar)

## ✨ Features

- 🎯 **Real GitHub Data** - Shows actual contribution data from GitHub API
- 🎨 **8 Animation Patterns** - Conway's Game of Life, Waves, Spirals, Ripples, Rain, Noise, Rule 30
- 🌙 **Dark/Light Themes** - Automatic theme switching
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎮 **Interactive** - Click letters to trigger different animations
- 📅 **Custom Date Ranges** - Show any year or date range
- 🔧 **Environment Variables** - Support for `.env` files
- 🪝 **React Hooks** - Custom hook for data fetching
- 📦 **TypeScript Support** - Full type definitions
- ⚡ **Next.js Ready** - Optimized for Next.js applications

## 🚀 Quick Start

### Installation

```bash
npm install react-animated-github-contribution-calendar
# or
yarn add react-animated-github-contribution-calendar
```

### Environment Variables

Create a `.env.local` file in your project root:

```env
# For client-side usage (Next.js)
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username

# For server-side usage (Next.js API routes)
GITHUB_TOKEN=your_github_token_here
```

### Basic Usage

```tsx
import React from 'react';
import { ContributionCalendar } from 'react-animated-github-contribution-calendar';

function App() {
  return (
    <ContributionCalendar
      githubToken={process.env.NEXT_PUBLIC_GITHUB_TOKEN}
      username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
      theme="dark"
    />
  );
}

export default App;
```

### Using the Custom Hook

```tsx
import React from 'react';
import { useGitHubContributions } from 'react-animated-github-contribution-calendar';

function MyComponent() {
  const { data, loading, error, refetch } = useGitHubContributions({
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    username: process.env.NEXT_PUBLIC_GITHUB_USERNAME,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31')
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{data?.username}'s Contributions</h2>
      <p>Total: {data?.totalContributions} contributions</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## ⚙️ Configuration

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `githubToken` | string | `process.env.NEXT_PUBLIC_GITHUB_TOKEN` | GitHub Personal Access Token |
| `username` | string | `process.env.NEXT_PUBLIC_GITHUB_USERNAME` | GitHub username to display |
| `theme` | `'light' \| 'dark'` | `'dark'` | Theme: 'light' or 'dark' |
| `startDate` | Date | Current year start | Start date for the calendar |
| `endDate` | Date | Current year end | End date for the calendar |
| `animationSpeed` | number | `150` | Animation speed in milliseconds |
| `maxGenerations` | number | `500` | Maximum animation cycles |
| `squareSize` | number | `14` | Size of contribution squares in pixels |
| `gapSize` | number | `3` | Gap between squares in pixels |
| `gridRows` | number | `7` | Number of grid rows |
| `gridCols` | number | `53` | Number of grid columns |
| `className` | string | `''` | Custom CSS class name |
| `onAnimationStart` | function | - | Callback when animation starts |
| `onAnimationStop` | function | - | Callback when animation stops |
| `onDataLoad` | function | - | Callback when data is loaded |
| `onError` | function | - | Callback when error occurs |

### Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `token` | string | `process.env.NEXT_PUBLIC_GITHUB_TOKEN` | GitHub Personal Access Token |
| `username` | string | `process.env.NEXT_PUBLIC_GITHUB_USERNAME` | GitHub username |
| `startDate` | Date | Current year start | Start date for the calendar |
| `endDate` | Date | Current year end | End date for the calendar |
| `gridRows` | number | `7` | Number of grid rows |
| `gridCols` | number | `53` | Number of grid columns |
| `autoFetch` | boolean | `true` | Enable automatic refetching |
| `refetchInterval` | number | `0` | Refetch interval in milliseconds |

## 🎮 Animation Patterns

Click on the letters in "Activity" to trigger different animations:

- **A** - Conway's Game of Life
- **c** - Random Noise
- **t** - Wave Pattern
- **i** - Spiral Pattern
- **v** - Rule 30 Cellular Automaton
- **i** - Rain Effect
- **t** - Ripple Effect
- **y** - Conway's Game of Life

## 🔑 GitHub Token Setup

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select only "public_repo" permission
4. Copy the token and add it to your environment variables

## 🎨 Customization

### CSS Variables

You can customize the appearance using CSS variables:

```css
.contribution-calendar-container {
    --cc-bg-light: #ffffff;
    --cc-bg-dark: #070707;
    --cc-text-light: #1f2937;
    --cc-text-dark: #f0f6fc;
    --cc-blue-light: #3b82f6;
    --cc-blue-dark: #60a5fa;
    --cc-square-size: 16px;
    --cc-gap-size: 2px;
}
```

### Custom Styling

```tsx
<ContributionCalendar
  className="my-custom-calendar"
  squareSize={16}
  gapSize={2}
  theme="light"
/>
```

## 📱 Next.js Integration

### App Router (Next.js 13+)

```tsx
// app/page.tsx
'use client';

import { ContributionCalendar } from 'react-animated-github-contribution-calendar';

export default function Home() {
  return (
    <div>
      <h1>My Portfolio</h1>
      <ContributionCalendar
        githubToken={process.env.NEXT_PUBLIC_GITHUB_TOKEN}
        username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
      />
    </div>
  );
}
```

### Pages Router (Next.js 12 and below)

```tsx
// pages/index.tsx
import { ContributionCalendar } from 'react-animated-github-contribution-calendar';

export default function Home() {
  return (
    <div>
      <h1>My Portfolio</h1>
      <ContributionCalendar
        githubToken={process.env.NEXT_PUBLIC_GITHUB_TOKEN}
        username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
      />
    </div>
  );
}
```

### API Route (Server-side)

```typescript
// pages/api/contributions.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.GITHUB_TOKEN; // Server-side token
  
  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { login: req.query.username }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
}
```

## 🔒 Security Notes

- **Client-side tokens** (`NEXT_PUBLIC_*`) are visible in the browser
- **Server-side tokens** are secure and only accessible in API routes
- Only use tokens with minimal permissions (public_repo access)
- Consider using server-side API routes for production applications

## 🛠️ Development

### Building from Source

```bash
git clone https://github.com/ogvaibhavshukla/react-animated-github-contribution-calendar.git
cd react-animated-github-contribution-calendar
npm install
npm run build
```

### Development Server

```bash
npm run dev
```

### Testing

```bash
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: ogvaibhavshukla@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/ogvaibhavshukla/react-animated-github-contribution-calendar/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ogvaibhavshukla/react-animated-github-contribution-calendar/discussions)

## 🙏 Acknowledgments

- Inspired by GitHub's contribution graph
- Conway's Game of Life algorithm
- React and Next.js communities

---

Made with ❤️ by [Vaibhav Shukla](https://github.com/ogvaibhavshukla)
