# Implementation Plan: CS2 WeaponPaints Web Interface

## Overview

This implementation plan breaks down the CS2 WeaponPaints Web Interface into discrete coding tasks. The system will be built using TypeScript with Node.js/Express for the backend API and React with TypeScript for the frontend SPA. The implementation follows an incremental approach, starting with core infrastructure, then authentication, followed by data management, and finally the UI components.

## Tasks

- [x] 1. Set up project structure and development environment
  - Create monorepo structure with backend and frontend directories
  - Initialize TypeScript configuration for both backend and frontend
  - Set up package.json with dependencies (Express, React, mysql2, Passport, fast-check, etc.)
  - Configure ESLint and Prettier for code quality
  - Set up testing frameworks (Jest for backend, React Testing Library for frontend)
  - Create .env.example files for environment configuration
  - _Requirements: 13.1_

- [x] 2. Implement database connection and models
  - [x] 2.1 Create MySQL database connection module
    - Write database connection pool configuration using mysql2
    - Implement connection health check and retry logic
    - Add environment variable configuration for database credentials
    - _Requirements: 13.1_
  
  - [x] 2.2 Create TypeScript interfaces for database models
    - Define interfaces for all database tables (wp_player_skins, wp_player_knife, wp_player_gloves, wp_player_agents, wp_player_music, wp_player_pins)
    - Define TypeScript types for Steam_ID, Team_Value, and other domain types
    - _Requirements: 13.2, 13.3, 13.4_
  
  - [x] 2.3 Write unit tests for database connection
    - Test connection pool creation and health checks
    - Test error handling for connection failures
    - _Requirements: 13.1_

- [x] 3. Implement data transformation layer
  - [x] 3.1 Create sticker serialization/deserialization functions
    - Write serializeStickers function to convert Sticker[] to delimited string
    - Write deserializeStickers function to parse delimited string to Sticker[]
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 13.6_
  
  - [x] 3.2 Write property test for sticker serialization round-trip
    - **Property 19: Sticker Serialization Round-Trip**
    - **Validates: Requirements 10.3, 10.4, 10.5, 10.6, 13.6**
  
  - [x] 3.3 Create keychain serialization/deserialization functions
    - Write serializeKeychain function to convert Keychain to delimited string
    - Write deserializeKeychain function to parse delimited string to Keychain
    - _Requirements: 11.3, 11.4, 11.5, 13.6_
  
  - [x] 3.4 Write property test for keychain serialization round-trip
    - **Property 20: Keychain Serialization Round-Trip**
    - **Validates: Requirements 11.3, 11.4, 11.5, 13.6**

- [x] 4. Implement input validation layer
  - [x] 4.1 Create validation functions for weapon configuration
    - Write validateWear function (0.00-1.00 range)
    - Write validateSeed function (0-1000 range)
    - Write validateNametag function (length and character validation)
    - Write validateStatTrakCounter function (non-negative integer)
    - Write validateStickers function (max 5 stickers, valid parameters)
    - _Requirements: 2.4, 2.5, 8.4, 9.2, 19.3_
  
  - [x] 4.2 Write property tests for validation functions
    - **Property 6: Wear Value Validation**
    - **Property 7: Seed Value Validation**
    - **Property 16: StatTrak Counter Validation**
    - **Property 17: Nametag Validation and Persistence**
    - **Property 28: Input Validation Rejection**
    - **Validates: Requirements 2.4, 2.5, 8.4, 9.2, 19.3, 19.4**
  
  - [x] 4.3 Write unit tests for validation edge cases
    - Test boundary values (0.00, 1.00 for wear; 0, 1000 for seed)
    - Test invalid inputs (negative values, out of range, non-numeric)
    - Test empty and null inputs
    - _Requirements: 2.4, 2.5, 8.4, 9.2_

- [x] 5. Implement item data loader
  - [x] 5.1 Create item data loader module
    - Write loadItemData function to read JSON files (skins_en.json, gloves_en.json, agents_en.json, music_en.json, collectibles_en.json)
    - Implement in-memory caching for loaded data
    - Add error handling for file loading failures with fallback to cache
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 5.2 Write unit tests for item data loader
    - Test successful file loading
    - Test error handling for missing files
    - Test cache fallback mechanism
    - Test JSON parse error handling
    - _Requirements: 14.1, 14.4_

- [x] 6. Implement Steam authentication
  - [x] 6.1 Set up Passport.js with Steam OpenID strategy
    - Configure passport-steam with Steam API key
    - Implement Steam authentication routes (/auth/steam, /auth/steam/callback)
    - Extract Steam_ID from authentication response as string
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 6.2 Write property test for Steam ID format
    - **Property 1: Steam ID String Format**
    - **Validates: Requirements 1.3, 13.2**
  
  - [x] 6.3 Implement session management
    - Configure express-session with secure settings
    - Create session store (memory for development, Redis for production)
    - Implement session creation on successful authentication
    - Implement session termination on logout
    - _Requirements: 1.4, 1.6, 19.1_
  
  - [x] 6.4 Write property tests for session management
    - **Property 2: Session Creation on Authentication**
    - **Property 3: Session Termination on Logout**
    - **Validates: Requirements 1.4, 1.6**
  
  - [x] 6.5 Write integration tests for authentication flow
    - Test full Steam OpenID flow (redirect → callback → session creation)
    - Test logout flow (session termination)
    - Test session expiration handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 19.2_

- [x] 7. Checkpoint - Ensure authentication and data loading work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement authorization middleware
  - [x] 8.1 Create authentication middleware
    - Write requireAuth middleware to check for valid session
    - Implement session expiration check
    - Return 401 Unauthorized for missing/invalid sessions
    - _Requirements: 19.2_
  
  - [x] 8.2 Create authorization middleware
    - Write verifySteamId middleware to check session Steam_ID matches requested data Steam_ID
    - Return 403 Forbidden for mismatched Steam_IDs
    - Log security events for authorization failures
    - _Requirements: 13.5, 19.6_
  
  - [x] 8.3 Write property test for authorization enforcement
    - **Property 29: Authorization Enforcement**
    - **Validates: Requirements 13.5, 19.6**
  
  - [x] 8.4 Write unit tests for middleware
    - Test authentication middleware with valid/invalid sessions
    - Test authorization middleware with matching/mismatching Steam_IDs
    - Test error responses and logging
    - _Requirements: 19.2, 19.6_

- [x] 9. Implement weapon configuration API endpoints
  - [x] 9.1 Create GET /api/player/weapons endpoint
    - Query wp_player_skins table by Steam_ID
    - Deserialize stickers and keychains from database format
    - Return all weapon configurations
    - _Requirements: 2.7, 13.5_
  
  - [x] 9.2 Create PUT /api/player/weapons/:weaponId endpoint
    - Validate request body (wear, seed, nametag, stattrak, stickers, keychains)
    - Serialize stickers and keychains to database format
    - Insert or update wp_player_skins table
    - Return saved configuration
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 8.2, 8.5, 9.3, 10.5, 11.4, 13.3_
  
  - [x] 9.3 Create DELETE /api/player/weapons/:weaponId endpoint
    - Delete weapon configuration from wp_player_skins table
    - Return success response
    - _Requirements: 18.4_
  
  - [x] 9.4 Write property tests for weapon configuration
    - **Property 5: Weapon Configuration Persistence**
    - **Property 15: StatTrak Configuration Persistence**
    - **Property 18: Nametag Round-Trip**
    - **Property 21: Complete Weapon Configuration Persistence**
    - **Validates: Requirements 2.3, 2.6, 2.7, 8.2, 8.5, 9.3, 9.4, 13.3**
  
  - [x] 9.5 Write unit tests for weapon endpoints
    - Test successful weapon configuration save and load
    - Test validation errors for invalid inputs
    - Test authorization (Steam_ID mismatch)
    - Test database error handling
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 10. Implement team-specific configuration API endpoints
  - [ ] 10.1 Create knife configuration endpoints
    - Implement GET /api/player/knife/:team
    - Implement PUT /api/player/knife/:team
    - Implement DELETE /api/player/knife/:team
    - Validate team parameter (2 or 3)
    - Query/update wp_player_knife table with Team_Value
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 10.2 Create glove configuration endpoints
    - Implement GET /api/player/gloves/:team
    - Implement PUT /api/player/gloves/:team
    - Implement DELETE /api/player/gloves/:team
    - Query/update wp_player_gloves table with Team_Value
    - _Requirements: 4.3, 4.4_
  
  - [ ] 10.3 Create agent configuration endpoints
    - Implement GET /api/player/agents/:team
    - Implement PUT /api/player/agents/:team
    - Implement DELETE /api/player/agents/:team
    - Query/update wp_player_agents table with Team_Value
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 10.4 Create music kit configuration endpoints
    - Implement GET /api/player/music/:team
    - Implement PUT /api/player/music/:team
    - Implement DELETE /api/player/music/:team
    - Query/update wp_player_music table with Team_Value
    - _Requirements: 6.3, 6.4_
  
  - [ ] 10.5 Create pin configuration endpoints
    - Implement GET /api/player/pins/:team
    - Implement PUT /api/player/pins/:team
    - Implement DELETE /api/player/pins/:team
    - Query/update wp_player_pins table with Team_Value
    - _Requirements: 7.3, 7.4_
  
  - [ ] 10.6 Write property tests for team-specific configurations
    - **Property 8: Team-Specific Data Isolation**
    - **Property 9: Team Configuration Loading**
    - **Property 10: Knife Configuration with Wear and Seed**
    - **Property 11: Glove Configuration Round-Trip**
    - **Property 12: Agent Configuration Round-Trip**
    - **Property 13: Music Kit Configuration Round-Trip**
    - **Property 14: Pin Configuration Round-Trip**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 4.3, 4.4, 5.3, 5.4, 5.5, 6.3, 6.4, 7.3, 7.4, 12.1, 12.2, 12.3, 13.4**
  
  - [ ] 10.7 Write unit tests for team-specific endpoints
    - Test successful save and load for each item type
    - Test team isolation (T vs CT)
    - Test validation errors
    - Test authorization
    - _Requirements: 3.2, 3.4, 4.3, 5.3, 5.4, 6.3, 7.3_

- [ ] 11. Implement bulk operations API endpoints
  - [ ] 11.1 Create POST /api/player/copy-team endpoint
    - Accept source team, target team, and categories in request body
    - Query all configurations for source team
    - Create new entries for target team with copied data
    - Return success response
    - _Requirements: 12.5, 18.1, 18.2_
  
  - [ ] 11.2 Create POST /api/player/reset endpoint
    - Accept categories to reset in request body
    - Delete specified configuration entries from database
    - Return success response
    - _Requirements: 18.4_
  
  - [ ] 11.3 Write property tests for bulk operations
    - **Property 26: Team Configuration Copy**
    - **Property 27: Configuration Reset**
    - **Validates: Requirements 12.5, 18.1, 18.2, 18.4**
  
  - [ ] 11.4 Write unit tests for bulk operations
    - Test copy operation with various configurations
    - Test reset operation for different categories
    - Test error handling
    - _Requirements: 18.1, 18.2, 18.4_

- [ ] 12. Implement item data API endpoints
  - [ ] 12.1 Create item data endpoints
    - Implement GET /api/items/skins (return skins_en.json data)
    - Implement GET /api/items/gloves (return gloves_en.json data)
    - Implement GET /api/items/agents (return agents_en.json data)
    - Implement GET /api/items/music (return music_en.json data)
    - Implement GET /api/items/pins (return collectibles_en.json data)
    - _Requirements: 2.2, 4.1, 5.1, 6.1, 7.1, 14.2_
  
  - [ ] 12.2 Write property test for item identifier correctness
    - **Property 22: Item Identifier Correctness**
    - **Validates: Requirements 14.3**
  
  - [ ] 12.3 Write unit tests for item endpoints
    - Test successful data retrieval
    - Test error handling for missing files
    - Test cache usage
    - _Requirements: 14.1, 14.2, 14.4_

- [ ] 13. Implement error handling and logging
  - [ ] 13.1 Create error handling middleware
    - Write global error handler for Express
    - Implement error response formatting
    - Add error message sanitization to prevent sensitive data exposure
    - _Requirements: 20.2_
  
  - [ ] 13.2 Create logging module
    - Set up logging library (Winston or Pino)
    - Implement structured logging with timestamp, user context, and error details
    - Configure log levels and output destinations
    - _Requirements: 20.1, 20.4_
  
  - [ ] 13.3 Write property tests for error handling
    - **Property 30: Error Logging Completeness**
    - **Property 31: Error Message Sanitization**
    - **Validates: Requirements 20.1, 20.2, 20.4**
  
  - [ ] 13.4 Write unit tests for error handling
    - Test error response formatting
    - Test error message sanitization
    - Test logging for various error types
    - _Requirements: 20.1, 20.2, 20.4_

- [ ] 14. Checkpoint - Ensure all backend functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Set up React frontend project
  - [ ] 15.1 Initialize React project with TypeScript
    - Create React app with TypeScript template (Vite or Create React App)
    - Configure Tailwind CSS for styling
    - Set up React Router for client-side routing
    - Install dependencies (Axios, TanStack Query, Zustand)
    - _Requirements: 15.1_
  
  - [ ] 15.2 Create project structure and shared components
    - Create directory structure (components, pages, hooks, services, types)
    - Define TypeScript interfaces for all data models (User, WeaponSkin, Glove, Agent, etc.)
    - Create API client service using Axios
    - _Requirements: 15.1_

- [ ] 16. Implement authentication UI components
  - [ ] 16.1 Create LoginPage component
    - Display Steam login button
    - Handle authentication redirect
    - Show loading state during authentication
    - _Requirements: 1.1, 1.2_
  
  - [ ] 16.2 Create AuthGuard component
    - Protect authenticated routes
    - Redirect unauthenticated users to login
    - Validate session on mount
    - _Requirements: 1.5, 19.2_
  
  - [ ] 16.3 Create user profile display component
    - Display Steam profile information (name, avatar)
    - Add logout button
    - _Requirements: 1.5, 1.6_
  
  - [ ] 16.4 Write unit tests for authentication components
    - Test LoginPage rendering and interactions
    - Test AuthGuard redirect logic
    - Test user profile display
    - _Requirements: 1.1, 1.2, 1.5, 1.6_

- [ ] 17. Implement layout components
  - [ ] 17.1 Create AppLayout component
    - Implement top navigation bar with user profile and logout
    - Create sidebar navigation for customization categories
    - Add main content area
    - Implement responsive breakpoints for mobile/tablet/desktop
    - _Requirements: 15.1_
  
  - [ ] 17.2 Create NavigationSidebar component
    - Add links to: Weapons, Knives, Gloves, Agents, Music Kits, Pins
    - Implement active route highlighting
    - Make collapsible on mobile
    - _Requirements: 15.1_
  
  - [ ] 17.3 Write unit tests for layout components
    - Test AppLayout rendering
    - Test NavigationSidebar links and active state
    - Test responsive behavior
    - _Requirements: 15.1_

- [ ] 18. Implement shared UI components
  - [ ] 18.1 Create ItemGrid component
    - Implement reusable grid for displaying items
    - Add search input
    - Add filter dropdowns (rarity, collection, type)
    - Implement pagination or infinite scroll
    - Create item cards with image, name, and selection state
    - _Requirements: 15.3, 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 18.2 Write property tests for search and filter
    - **Property 23: Search Functionality**
    - **Property 24: Filter Functionality**
    - **Property 25: Filter Clear Restoration**
    - **Validates: Requirements 17.2, 17.3, 17.4**
  
  - [ ] 18.3 Create ItemPreview component
    - Display large preview image of selected item
    - Add wear slider with live preview update
    - Add seed input with preview update
    - Show item details (name, rarity, collection)
    - _Requirements: 16.1, 16.2_
  
  - [ ] 18.4 Create TeamTabs component
    - Implement tab component for T/CT team switching
    - Display team-specific data
    - Add visual indicator for active team
    - _Requirements: 3.1, 12.2_
  
  - [ ] 18.5 Write unit tests for shared components
    - Test ItemGrid rendering, search, and filter
    - Test ItemPreview display and interactions
    - Test TeamTabs switching
    - _Requirements: 15.3, 16.1, 17.1, 17.2, 17.3_

- [ ] 19. Implement weapon customization UI
  - [ ] 19.1 Create WeaponCustomizer component
    - Implement weapon category tabs (Rifles, Pistols, SMGs, etc.)
    - Create weapon selection grid
    - Add skin selection modal with search/filter
    - _Requirements: 2.1, 2.2_
  
  - [ ] 19.2 Create weapon configuration panel
    - Add wear slider (0.00-1.00)
    - Add seed input (0-1000)
    - Add nametag input field
    - Add StatTrak toggle and counter input
    - Add save/reset buttons
    - _Requirements: 2.4, 2.5, 8.1, 8.3, 9.1_
  
  - [ ] 19.3 Create StickerConfigurator component
    - Display list of applied stickers (max 5)
    - Add "Add sticker" button
    - Implement per-sticker configuration (position, wear, scale, rotation)
    - Add remove sticker button
    - _Requirements: 10.1, 10.2_
  
  - [ ] 19.4 Create KeychainConfigurator component
    - Implement keychain selection
    - Add position configuration (x, y, z)
    - Add seed input
    - _Requirements: 11.1, 11.2_
  
  - [ ] 19.5 Integrate weapon customizer with API
    - Fetch weapon skins from /api/items/skins
    - Load player weapon configurations from /api/player/weapons
    - Save weapon configurations to /api/player/weapons/:weaponId
    - Handle loading states and errors
    - _Requirements: 2.2, 2.3, 2.6, 2.7, 15.4, 15.5, 15.6_
  
  - [ ] 19.6 Write unit tests for weapon customization UI
    - Test WeaponCustomizer rendering and interactions
    - Test configuration panel inputs and validation
    - Test sticker and keychain configurators
    - Test API integration with mocked responses
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 8.1, 9.1, 10.1, 11.1_

- [ ] 20. Implement team-specific customization UI components
  - [ ] 20.1 Create KnifeCustomizer component
    - Add team selector tabs (T/CT)
    - Implement knife model selection grid
    - Add skin selection with preview
    - Add wear and seed configuration
    - Add save button per team
    - Integrate with /api/player/knife/:team endpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 20.2 Create GloveCustomizer component
    - Add team selector tabs (T/CT)
    - Implement glove model selection grid with previews
    - Add save button per team
    - Integrate with /api/player/gloves/:team endpoints
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 20.3 Create AgentCustomizer component
    - Add team selector tabs (T/CT)
    - Implement agent model selection grid with images
    - Add save button per team
    - Integrate with /api/player/agents/:team endpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 20.4 Create MusicKitCustomizer component
    - Add team selector tabs (T/CT)
    - Implement music kit selection list
    - Add save button per team
    - Integrate with /api/player/music/:team endpoints
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 20.5 Create PinCustomizer component
    - Add team selector tabs (T/CT)
    - Implement pin selection grid with images
    - Add save button per team
    - Integrate with /api/player/pins/:team endpoints
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 20.6 Write unit tests for team-specific customization UI
    - Test each customizer component rendering
    - Test team tab switching
    - Test item selection and save operations
    - Test API integration with mocked responses
    - _Requirements: 3.1, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2_

- [ ] 21. Implement bulk operations UI
  - [ ] 21.1 Create team copy functionality
    - Add "Copy to other team" button in team-specific customizers
    - Implement confirmation dialog
    - Call /api/player/copy-team endpoint
    - Show success/error messages
    - Refresh UI after copy
    - _Requirements: 18.1, 18.2, 18.5_
  
  - [ ] 21.2 Create reset functionality
    - Add "Reset" button in customizers
    - Implement confirmation dialog
    - Call /api/player/reset endpoint
    - Show success/error messages
    - Refresh UI after reset
    - _Requirements: 18.3, 18.4, 18.5_
  
  - [ ] 21.3 Write unit tests for bulk operations UI
    - Test copy functionality with confirmation
    - Test reset functionality with confirmation
    - Test success/error message display
    - _Requirements: 18.1, 18.3, 18.5_

- [ ] 22. Implement error handling and loading states in UI
  - [ ] 22.1 Create error boundary component
    - Implement React error boundary
    - Display user-friendly error messages
    - Add error recovery options
    - _Requirements: 15.6, 20.2_
  
  - [ ] 22.2 Add loading indicators
    - Create loading spinner component
    - Add loading states to all data fetching operations
    - Show skeleton screens for content loading
    - _Requirements: 15.5_
  
  - [ ] 22.3 Implement error message display
    - Create toast/notification component for errors
    - Display validation errors inline in forms
    - Show API error messages to users
    - _Requirements: 15.6, 19.4_
  
  - [ ] 22.4 Write unit tests for error handling UI
    - Test error boundary rendering
    - Test loading indicator display
    - Test error message display
    - _Requirements: 15.5, 15.6_

- [ ] 23. Checkpoint - Ensure all frontend functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Implement end-to-end integration
  - [ ] 24.1 Wire frontend and backend together
    - Configure API base URL in frontend
    - Set up CORS in backend for frontend origin
    - Configure session cookies for cross-origin requests
    - Test full authentication flow
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 24.2 Test complete user workflows
    - Test login → weapon customization → save → load workflow
    - Test team-specific customization workflows
    - Test bulk operations (copy, reset)
    - Test error scenarios (invalid input, session expiration)
    - _Requirements: All requirements_
  
  - [ ] 24.3 Write integration tests
    - Test full authentication flow
    - Test weapon configuration end-to-end
    - Test team-specific configuration end-to-end
    - Test bulk operations end-to-end
    - _Requirements: All requirements_

- [ ] 25. Final checkpoint - Ensure all tests pass and system works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows an incremental approach: infrastructure → backend → frontend → integration
- All property tests must include comment tags: `// Feature: cs2-weaponpaints-web-interface, Property N: [property title]`
