# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Testing with Playwright MCP

**Always use Playwright MCP tools to manually test changes in the browser**, even if the user doesn't explicitly ask. After making UI or functionality changes:
1. Use `mcp__playwright__browser_navigate` to open the app
2. Use `mcp__playwright__browser_snapshot` to verify the UI state
3. Interact with elements using `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, etc.

**Login limitation**: The app requires Google Auth with `@bamboohr.com` domain. Playwright MCP cannot complete OAuth flows, so testing is limited to:
- Verifying the login screen renders correctly
- Testing post-login flows if already authenticated in the browser session
- Visual inspection of UI components

## Commands

```bash
# Install dependencies
npm install

# Run locally (requires a server - this is a static site served by Express placeholder)
npm start

# Run Playwright tests
npm test
npx playwright test              # all tests
npx playwright test --ui         # interactive UI mode
npx playwright test <test-file>  # single test file
```

## Architecture

This is a **single-file application** - all HTML, CSS, and JavaScript live in `index.html`.

### Tech Stack
- **Frontend**: Vanilla JavaScript with embedded CSS
- **Backend**: Firebase Realtime Database (no server code in repo)
- **Auth**: Firebase Google Auth, restricted to `@bamboohr.com` domain
- **Hosting**: GitHub Pages at https://afterrburn.github.io/planning-poker/

### Key Concepts

**Firebase Integration**: The app uses Firebase for both authentication and real-time state sync:
- `firebase.auth()` - Google OAuth restricted to BambooHR domain
- `firebase.database()` - Real-time sync of rooms, users, votes

**Room State Structure** (in Firebase):
```
rooms/{roomId}/
  ├── story: string
  ├── revealed: boolean
  └── users/{odId}/
        ├── name: string
        ├── odId: string (Firebase user UID)
        ├── vote: number | string | null
        └── joinedAt: timestamp
```

**Key Variables**:
- `currentUser` - Firebase auth user object
- `roomRef` - Firebase database reference for current room
- `odId` - Unique session ID (per room, not per user)
- `currentRoom` - Room ID string

**Voting Flow**: Select card → `vote()` updates Firebase → `roomRef.on('value')` triggers `updateUI()` for all participants
