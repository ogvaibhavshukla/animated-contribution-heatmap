# Changelog

## [1.1.0] - 2024-09-14
### MAJOR ADDITIONS
- IMPLEMENTED: All 8 animation patterns (Conway's Game of Life, Waves, Spirals, Ripples, Rain, Noise, Rule 30)
- ADDED: Interactive letter clicking to trigger animations
- ADDED: Animation controls (start, stop, randomize, clear, show real data)
- ADDED: useAnimationPatterns hook for animation logic

### ANIMATION FEATURES
- Conway's Game of Life cellular automaton
- Wave pattern animations
- Spiral motion effects  
- Ripple propagation animations
- Rain drop effects
- Random noise patterns
- Rule 30 cellular automaton
- Smooth transitions between patterns and real data

### TECHNICAL IMPROVEMENTS
- Added AnimationPattern type definitions
- Integrated animation state management
- Added animation-specific CSS classes
- Exported animation hook for external use

## [1.0.4] - 2024-09-14
### CRITICAL FIXES
- FIXED: Infinite re-render loop causing excessive GitHub API requests
- FIXED: GitHub API rate limiting exhaustion within minutes
- FIXED: Component flickering and unstable loading states

### CRITICAL IMPROVEMENTS  
- ADDED: Request throttling protection (1 second minimum between requests)
- ADDED: Simultaneous request prevention system
- ADDED: Stable callback reference handling using useRef pattern
- IMPROVED: Error handling and loading state management

### TECHNICAL CHANGES
- REMOVED: Problematic callback dependencies from useCallback
- IMPLEMENTED: Rate limiting safety mechanisms
- ENHANCED: Request deduplication and conflict prevention

## [1.0.3] - 2024-12-19
### Fixed
- Fixed infinite re-render loop causing excessive API requests
- Added rate limiting protection to prevent GitHub API exhaustion
- Stabilized callback dependencies to prevent unnecessary re-fetches

### Changed
- Improved error handling and loading state management
- Added request throttling mechanism
- Used stable callback references to prevent infinite loops

## [1.0.2] - Previous version
### Features
- Initial release with animated GitHub contribution calendar
- Support for light and dark themes
- Customizable grid dimensions and styling
- TypeScript support
