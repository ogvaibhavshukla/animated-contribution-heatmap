# Changelog

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
