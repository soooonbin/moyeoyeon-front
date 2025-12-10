# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MOYEOYEON (모여연) is a year-end retrospective platform where users create rooms, invite friends via shareable links, and engage in real-time chat while answering curated questions together. This is the frontend React application.

## Development Commands

```bash
# Development server (runs on Vite dev server)
npm run dev

# Production build (outputs to ../build directory, not ./dist)
npm run build

# Preview production build
npm run preview

# Tests (currently placeholder, returns exit 0)
npm test
```

## Architecture Overview

### API Communication Strategy

**Critical**: This app uses dual API addressing:
1. **Backend URL**: Set via `VITE_API_BASE_URL` in `.env.local` (currently ngrok tunnel)
2. **Fallback**: Defaults to `http://localhost:8080` if env var is missing
3. **Construction**: Always strip trailing slashes: `API_BASE.replace(/\/+$/, "")`

All API calls use fetch (not axios despite it being installed) and must:
- Check Content-Type header before parsing (HTML error pages vs JSON)
- Use try-catch for all network operations
- Handle both array and single object responses flexibly

### WebSocket Architecture (useChatSocket Hook)

Real-time chat uses STOMP over SockJS:
- **Connection**: `new SockJS(VITE_API_BASE_URL + "/ws")`
- **Subscribe**: `/topic/chat/${roomId}`
- **Publish**: `/app/chat/${roomId}`
- **Auto-reconnect**: 5000ms delay
- **Cleanup**: Client deactivates on unmount

The hook returns a `send()` function but manages subscription internally via `onMessageReceive` callback.

### State Management Pattern

No global state library (Redux/Zustand) is used. State persists via:

1. **localStorage**: User data keyed by room
   ```javascript
   localStorage.setItem(`moyeo:room:${roomId}:userId`, userId);
   localStorage.setItem(`moyeo:room:${roomId}:userName`, userName);
   ```
   Always wrap in try-catch as localStorage can throw.

2. **React Router state**: Pass data between pages via `navigate(path, { state: {...} })`

3. **Component local state**: All UI state lives in component useState

### Build Configuration Quirks

- **Output directory**: `../build` (parent directory, not ./dist)
- **Path alias**: `@/*` maps to `./src/*`
- **Proxy**: `/api` requests proxy to `VITE_API_BASE_URL` during dev
- **TypeScript**: Uses `moduleResolution: "bundler"` (not node)

### Routing Structure

```
/ (Main)
  → /select-room (SelectRoom - currently unused, direct to /create-room)
    → /create-room (CreateRoom)
      → /chat-room/:roomId (ChatRoom)

/invite/:inviteId (InviteRoom - separate entry point)
```

Navigation typically uses `useNavigate()` with programmatic routing, not `<Link>` components.

### Data Flow: Room Creation → Chat

1. **CreateRoom**: User fills form → POST `/api/room` → receives `roomId` + `userId`
2. **localStorage**: Store `userId` and `userName` keyed by `roomId`
3. **Navigation**: `navigate(/chat-room/${roomId})` (no state passed)
4. **ChatRoom**: Reads `roomId` from URL params, `userId`/`userName` from localStorage
5. **API fetch**: GET `/api/room/${roomId}` to load room details and member list
6. **WebSocket**: Connect to `/ws` and subscribe to `/topic/chat/${roomId}`

### Backend Response Handling

The backend API has inconsistent field naming. Frontend code handles multiple variations:
- `userImg` vs `userImgId` (both mean avatar ID 1-6)
- `userInfo` can be array, single object, or null
- Avatar/color fields sometimes missing, use defensive fallbacks

Always parse responses with `any` type first, then validate fields exist before accessing.

### Mobile-First Design

All pages are designed for 375-428px mobile viewport. On desktop, content centers with max-width constraints. Tailwind breakpoints are used sparingly - assume mobile unless explicitly responsive.

### Profile/Avatar System

- **Avatars**: 6 options (IDs 1-6), randomly assigned at room creation
- **Colors**: 5 options (IDs 1-5), randomly assigned at room creation
- **Editing**: ProfileSetupModal allows changing avatar (1-6) and name (1-20 chars)
- **Color**: Currently read-only in UI, server-controlled

### API Endpoints Reference

```
POST   /api/room              → Create room (returns roomId, userId, inviteId)
GET    /api/room/{roomId}     → Get room details + member list
PUT    /api/user/profile      → Update user profile (avatar, name)
WS     /ws                    → WebSocket endpoint for STOMP
```

## Important Code Patterns

### Environment Variable Access
Always use `import.meta.env.VITE_API_BASE_URL`, never `process.env`. Vite exposes env vars via import.meta.

### Form Validation
Forms use `useMemo()` to compute `isFormValid` based on all field validators. Buttons disable when invalid.

### Safe localStorage Access
```javascript
try {
  const value = localStorage.getItem(key);
  if (value) { /* use it */ }
} catch (err) {
  console.error('localStorage error:', err);
}
```

### Content-Type Validation
```javascript
const contentType = response.headers.get("Content-Type");
if (!contentType || !contentType.includes("application/json")) {
  throw new Error("응답이 HTML입니다. 백엔드 에러를 확인하세요.");
}
```

## Project Structure Notes

- **src/app/**: Router and Provider setup (Provider currently unused)
- **src/pages/**: Top-level route components (5 pages)
- **src/features/**: Feature-specific UI modules (profileSetup, headerMenu, inviteLink)
- **src/lib/hooks/**: Custom React hooks (currently only useChatSocket)
- **src/shares/ui/**: Reusable UI components (ActionButton, BaseModal)
- **src/components/ui/**: shadcn/ui components (button, card, input)

The architecture follows feature-based organization for domain logic (features/) and generic components (shares/, components/).

## Testing Notes

Tests are configured (Vitest, Testing Library) but not implemented. `npm test` exits 0 without running tests.

## Common Issues

1. **ngrok URL expiration**: When backend ngrok URL changes, update `.env.local` with new `VITE_API_BASE_URL`
2. **localStorage not persisting**: Check browser privacy settings, especially in incognito/private mode
3. **WebSocket connection fails**: Ensure `VITE_API_BASE_URL` doesn't have trailing slash and `/ws` endpoint is accessible
4. **Build output location**: Remember production build goes to `../build`, not `./dist`
