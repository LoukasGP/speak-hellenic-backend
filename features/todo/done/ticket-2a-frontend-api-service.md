# Ticket 2A: User API Service - Frontend Implementation

**Parent:** [Master Requirements](./README.md)  
**Status:** 🔴 Not Started  
**Estimated Time:** 1 hour  
**Dependencies:**

- ✅ Ticket 1 (Session Management)
- ⏳ Ticket 2B (Backend API must be deployed first)

**Knowledge:** [nextjs-authentication.md](../../../knowledge/nextjs-authentication.md) - Must be used to ensure best practices.

---

## 📋 Objective

Create the **frontend API client** for user operations. This service communicates with the backend API Gateway (deployed via Ticket 2B) using simple HTTP requests.

**This ticket focuses ONLY on the frontend Next.js code.**

---

## 🎯 What This Ticket Delivers

1. **API service client** (`src/services/userApiService.ts`)
2. **HTTP-based user operations:**
   - Create user (POST)
   - Get user by ID (GET)
   - Update last login (PUT)
3. **Integration with DAL** (`src/lib/dal.ts`)
4. **Environment variable configuration**
5. **Error handling** for network requests

---

## 📦 Prerequisites

### Must Be Completed First

- [x] **Ticket 1:** Session management implemented
- [ ] **Ticket 2B:** Backend API deployed and accessible
  - You need the API Gateway URL
  - You need the API Key for authentication

### Environment Variables Required

Add to `.env.local`:

```env
# Backend API Configuration (from Ticket 2B)
NEXT_PUBLIC_USER_API_URL=https://your-api-id.execute-api.eu-west-1.amazonaws.com/prod
USER_API_KEY=your-api-key-from-backend-team
```

**Note:** These values will be provided by whoever completes Ticket 2B.

---

## 🔨 Implementation Steps

### Step 1: Create User API Service

**File:** `src/services/userApiService.ts`

**Implementation:**

````typescript
/**
 * User API Service - Frontend HTTP Client
 *
 * This service provides HTTP-based access to user data via API Gateway.
 * Backend API uses VTL templates for direct DynamoDB integration.
 *
 * Architecture:
 * - Frontend (Next.js) → API Gateway → VTL → DynamoDB
 * - No AWS SDK dependencies in frontend
 * - Backend infrastructure managed in separate CDK repository
 */

import 'server-only';

/**
 * User data structure returned from backend API
 */
export interface User {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
const API_KEY = process.env.USER_API_KEY;

/**
 * Validate API configuration on module load
 */
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_USER_API_URL environment variable is required');
}

if (!API_KEY) {
  throw new Error('USER_API_KEY environment variable is required');
}

/**
 * Helper function to make authenticated API requests
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      ...options.headers,
    },
  });

  // Handle 404 as null (user not found)
  if (response.status === 404) {
    return null as T;
  }

  // Throw error for other non-2xx responses
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

/**
 * Create a new user in the backend database
 *
 * @param userData - User data from Google OAuth
 * @returns Created user record
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   userId: googleUser.sub,
 *   email: googleUser.email,
 *   name: googleUser.name,
 *   picture: googleUser.picture,
 * });
 * ```
 */
export async function createUser(userData: {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> {
  const now = new Date().toISOString();

  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify({
      userId: userData.userId,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      createdAt: now,
      lastLoginAt: now,
    }),
  });
}

/**
 * Retrieve user by Google user ID
 *
 * @param userId - Google user ID from OAuth profile
 * @returns User record or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserById('google-oauth2|123456789');
 * if (!user) {
 *   // Create new user
 * }
 * ```
 */
export async function getUserById(userId: string): Promise<User | null> {
  return apiRequest<User | null>(`/users/${userId}`, {
    method: 'GET',
  });
}

/**
 * Update user's last login timestamp
 *
 * @param userId - Google user ID
 * @returns Updated user record
 *
 * @example
 * ```typescript
 * await updateUserLastLogin(session.userId);
 * ```
 */
export async function updateUserLastLogin(userId: string): Promise<User> {
  const now = new Date().toISOString();

  return apiRequest<User>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({
      lastLoginAt: now,
    }),
  });
}
````

**Verification Checklist:**

- [ ] File created at `src/services/userApiService.ts`
- [ ] Imports `'server-only'` to prevent client-side usage
- [ ] Environment variables validated on module load
- [ ] `apiRequest()` helper handles authentication headers
- [ ] `createUser()` implemented with POST request
- [ ] `getUserById()` implemented with GET request
- [ ] `updateUserLastLogin()` implemented with PUT request
- [ ] 404 responses return `null` gracefully
- [ ] All other errors throw with descriptive messages
- [ ] No TypeScript errors

---

### Step 2: Update DAL to Use API Service

**File:** `src/lib/dal.ts`

**Current Import (Change This):**

```typescript
import { getUserById } from '@/services/dynamodbService'; // OLD
```

**New Import:**

```typescript
import { getUserById } from '@/services/userApiService'; // NEW
```

**The `getUser()` function should already work correctly with this change** because both services have the same interface.

**Verification Checklist:**

- [ ] Import changed from `dynamodbService` to `userApiService`
- [ ] `getUser()` function unchanged (interface compatibility)
- [ ] No TypeScript errors
- [ ] Build passes

---

### Step 3: Update Environment Variables

**File:** `.env.local.example`

Update the example file to show the new API configuration:

```env
# Session Management (Ticket 1)
SESSION_SECRET=your-secret-key-here-min-32-characters-long

# User API Configuration (Ticket 2A/2B)
# Backend API Gateway endpoint URL (from Ticket 2B deployment)
NEXT_PUBLIC_USER_API_URL=https://your-api-id.execute-api.eu-west-1.amazonaws.com/prod
# API Key for authenticating with backend (from Ticket 2B deployment)
USER_API_KEY=your-api-key-here

# Google OAuth Configuration (Ticket 3)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**File:** `.env.local`

Add the actual values (you'll get these from Ticket 2B):

```env
NEXT_PUBLIC_USER_API_URL=https://actual-api-url-here
USER_API_KEY=actual-api-key-here
```

**Verification Checklist:**

- [ ] `.env.local.example` updated with new variables
- [ ] `.env.local` updated with placeholder values
- [ ] Old DynamoDB variables removed (`DYNAMODB_USER_TABLE_NAME`, `AWS_REGION`)
- [ ] Comments explain where values come from (Ticket 2B)

---

## ✅ Acceptance Criteria

### Code Quality

- [ ] `userApiService.ts` uses `server-only` import
- [ ] All functions have JSDoc comments
- [ ] Error handling is comprehensive
- [ ] TypeScript types are properly defined
- [ ] No `any` types used

### Functionality

- [ ] Environment variables validated on startup
- [ ] API requests include `x-api-key` header
- [ ] API requests include `Content-Type: application/json` header
- [ ] 404 responses return `null` (not error)
- [ ] Other HTTP errors throw with status code
- [ ] `createUser()` sends all required fields
- [ ] `getUserById()` handles missing users gracefully
- [ ] `updateUserLastLogin()` updates timestamp

### Integration

- [ ] DAL imports from new `userApiService`
- [ ] No references to old `dynamodbService` remain
- [ ] Environment variables properly configured
- [ ] TypeScript compilation passes
- [ ] Next.js build passes

---

## 🧪 Testing & Verification

### Build Verification

```bash
npm run tsc
npm run build
```

**Expected Result:**

- ✅ TypeScript compilation succeeds
- ✅ Build completes without errors
- ✅ No import errors

### Manual Testing (After Ticket 2B Deployed)

**Test 1: Create User**

Create a test file `scripts/test-user-api.ts`:

```typescript
import { createUser, getUserById } from '@/services/userApiService';

async function testCreateUser() {
  const user = await createUser({
    userId: 'test-google-id-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/photo.jpg',
  });

  console.log('✅ User created:', user);
  return user;
}

testCreateUser();
```

**Test 2: Get User**

```typescript
async function testGetUser() {
  const user = await getUserById('test-google-id-123');
  console.log('✅ User retrieved:', user);
}

testGetUser();
```

**Test 3: Update Last Login**

```typescript
async function testUpdateLogin() {
  await updateUserLastLogin('test-google-id-123');
  const user = await getUserById('test-google-id-123');
  console.log('✅ Updated lastLoginAt:', user?.lastLoginAt);
}

testUpdateLogin();
```

**Test 4: 404 Handling**

```typescript
async function testNotFound() {
  const user = await getUserById('non-existent-user');
  console.log('✅ Non-existent user returns null:', user === null);
}

testNotFound();
```

---

## 📝 Notes

### Architecture

- **Frontend only makes HTTP requests** - no AWS SDK dependencies
- **Backend handles all database logic** - via VTL templates
- **API Gateway provides the interface** - deployed in Ticket 2B

### Security

- **API Key stored server-side only** - in environment variables
- **Never expose API Key client-side** - use `server-only` import
- **CORS configured on backend** - allows your frontend domain

### Error Handling

- **Network errors**: Caught and logged with full context
- **404 Not Found**: Returns `null` (user doesn't exist)
- **401 Unauthorized**: Throws error (check API key)
- **500 Server Error**: Throws error (backend issue)

### Performance

- **No caching implemented** - add later if needed
- **Direct API calls** - each request hits backend
- **Consider React cache()** - for frequently accessed users

---

## 🔗 Dependencies

### Blocks These Tickets

- **Ticket 3:** Google OAuth Routes (needs user creation/retrieval)
- **Ticket 4:** UI Components (needs user data)

### Requires Completion Of

- **Ticket 2B:** Backend API Infrastructure (provides API endpoint and key)

---

## 🆘 Troubleshooting

### "Environment variable not set"

**Error:** `NEXT_PUBLIC_USER_API_URL environment variable is required`

**Solution:**

1. Ensure `.env.local` exists
2. Add the variable with value from Ticket 2B
3. Restart Next.js dev server

### "API request failed: 401"

**Cause:** Invalid or missing API Key

**Solution:**

1. Check `USER_API_KEY` in `.env.local`
2. Verify API Key is correct (check with backend team)
3. Ensure API Key is not expired

### "API request failed: 403 CORS"

**Cause:** Frontend domain not allowed by backend

**Solution:**

1. Check CORS configuration in Ticket 2B deployment
2. Ensure your domain is in allowed origins
3. Verify preflight OPTIONS requests are handled

### "Network request failed"

**Cause:** Backend API not accessible

**Solution:**

1. Test API endpoint with curl:
   ```bash
   curl -H "x-api-key: YOUR_KEY" https://YOUR_API_URL/users/test-id
   ```
2. Verify API Gateway is deployed (check Ticket 2B)
3. Check internet connectivity

### TypeScript errors after implementation

**Common issues:**

- Missing `server-only` import
- Incorrect User interface
- Missing return types

**Solution:**

```bash
npm run tsc
# Fix errors shown in output
```

---

## ✅ Definition of Done

- [ ] `src/services/userApiService.ts` created and implemented
- [ ] `src/lib/dal.ts` updated to use new service
- [ ] `.env.local.example` updated with new variables
- [ ] `.env.local` configured (with placeholder values)
- [ ] Old `dynamodbService.ts` removed or deprecated
- [ ] TypeScript compilation passes (`npm run tsc`)
- [ ] Next.js build passes (`npm run build`)
- [ ] No console warnings or errors
- [ ] Code reviewed and approved
- [ ] Ready for integration with Ticket 3 (OAuth routes)

---

**Next Steps:**

After completing this ticket:

✅ **Completed:** Ticket 1, Ticket 2A  
⏳ **Waiting:** Ticket 2B (Backend deployment)  
➡️ **Next:** [Ticket 3: Google OAuth API Routes](./ticket-3-oauth-routes.md)

---

_Last Updated: 2025-01-03_
