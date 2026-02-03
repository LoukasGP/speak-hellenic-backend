# Ticket 2: User API Service (API Gateway Integration)

**Parent:** [Master Requirements](./README.md)  
**Status:** 🔴 Not Started (Split into 2A and 2B)  
**Estimated Time:** 3-4 hours total  
**Dependencies:** ✅ Ticket 1 (Session Management)

---

## 📋 Overview

This ticket has been **split into two sub-tickets** for better separation of concerns:

### ➡️ [Ticket 2A: Frontend API Service](./ticket-2a-frontend-api-service.md)

**Focus:** Next.js frontend code  
**Time:** 1 hour  
**Deliverables:**

- `src/services/userApiService.ts` - HTTP client
- Update `src/lib/dal.ts` to use API service
- Environment variable configuration

### ➡️ [Ticket 2B: Backend API Infrastructure](./ticket-2b-backend-api-infrastructure.md)

**Focus:** AWS CDK infrastructure deployment  
**Time:** 2-3 hours  
**Deliverables:**

- DynamoDB table
- API Gateway with VTL templates
- API Key authentication
- CORS configuration

---

## 🎯 Execution Order

**Option 1: Parallel Development (Recommended)**

Both tickets can be developed simultaneously by different team members:

- Frontend developer works on **Ticket 2A**
- Backend/DevOps developer works on **Ticket 2B**
- They coordinate on API contract (endpoints, request/response formats)

**Option 2: Backend-First (Safer)**

1. Complete **Ticket 2B** first (deploy infrastructure)
2. Retrieve API URL and API Key from deployment
3. Complete **Ticket 2A** with actual credentials

---

## 📋 Original Objective

Create the API service layer for user CRUD operations. This service communicates with a backend API Gateway that handles DynamoDB operations via VTL (Velocity Template Language) integration.

**Separation of Concerns:**

- **Frontend (Ticket 2A):** API client making HTTP requests
- **Backend (Ticket 2B):** API Gateway + VTL + DynamoDB infrastructure

---

## 🎯 Combined Deliverables

When both sub-tickets are complete, you will have:

### Frontend (Ticket 2A)

- ✅ HTTP client for user operations (`userApiService.ts`)
- ✅ Integration with session management (`dal.ts`)
- ✅ Environment variables configured
- ✅ Error handling for API requests

### Backend (Ticket 2B)

## 📦 Prerequisites (Combined)

### For Ticket 2A (Frontend)

- [x] Ticket 1 completed (session management works)
- [ ] Ticket 2B completed (backend API deployed)
- [ ] API Gateway URL received from backend team
- [ ] API Key received from backend team

### For Ticket 2B (Backend)

- [ ] AWS Account with appropriate permissions
- [ ] AWS CDK installed and configured
- [ ] Frontend domain known (for CORS configuration)Choose your approach:\*\*
  - Are you doing both frontend and backend? → Do Ticket 2B first
  - Are you only doing frontend? → Wait for Ticket 2B completion
  - Are you only doing backend? → Start with Ticket 2B

3. **Go to the appropriate ticket:**
   - Frontend developer → [Ticket 2A](./ticket-2a-frontend-api-service.md)
   - Backend developer → [Ticket 2B](./ticket-2b-backend-api-infrastructure.md)

---

## 📦 Prerequisites

- [x] Ticket 1 completed (session management works)
- [ ] **Backend API deployed** (via CDK in infrastructure repository)
  - API Gateway with user endpoints
  - VTL templates for DynamoDB operations
  - DynamoDB table: `speak-greek-now-users`
  - API Key or IAM authentication configured
- [ ] Environment variables in `.env.local`:
  ```env
  # Backend API Configuration
  NEXT_PUBLIC_USER_API_URL=https://api.yourdomain.com/users
  USER_API_KEY=your-api-key-from-backend
  # Or use AWS Signature V4 for IAM authentication
  ```

### Backend Infrastructure (Managed in CDK Repository)

**What the backend provides:**

## 🔗 API Contract (Agreed Between 2A and 2B)

**Base URL:** `https://{api-id}.execute-api.{region}.amazonaws.com/prod`

**Authentication:** API Key via `x-api-key` header

**Endpoints:**

| Method | Endpoint          | Purpose           | Implemented In  |
| ------ | ----------------- | ----------------- | --------------- |
| POST   | `/users`          | Create user       | Ticket 2B (VTL) |
| GET    | `/users/{userId}` | Get user by ID    | Ticket 2B (VTL) |
| PUT    | `/users/{userId}` | Update last login | Ticket 2B (VTL) |

**User Object Schema:**

```typescript
interface User {
  userId: string;       // Google OAuth ID (partition key)
---

## 🔨 Implementation Steps

**This section has been moved to sub-tickets:**

- Frontend implementation → [Ticket 2A](./ticket-2a-frontend-api-service.md)
- Backend implementation → [Ticket 2B](./ticket-2b-backend-api-infrastructure.md)

**Summary of what each ticket does:**
```

---

## 🔨 Implementation Steps

### Step 1: Create User API Service

**File:** `src/services/userApiService.ts`

**Required Functions:**

#### 1.1 `createUser(userData: CreateUserInput): Promise<User>`

- Make POST request to `/users` endpoint
- Send user data in request body
- Handle API errors (409 Conflict if user exists, 500 server errors)
- Return created user object

**Input Interface:**

```typescript
interface CreateUserInput {
  userId: string; // Google user ID
  email: string; // Google email
  name: string; // Display name
  picture?: string; // Profile picture URL (optional)
}
```

#### 1.2 `getUserById(userId: string): Promise<User | null>`

- Make GET request to `/users/{userId}`
- Return user object if found (200 OK)
- Return `null` if user doesn't exist (404 Not Found)
- Handle API errors

#### 1.3 `updateUserLastLogin(userId: string): Promise<void>`

#### 1.4 `getUserByEmail(email: string): Promise<User | null>` (Optional)

### Ticket 2A: Frontend Steps

**File:** `src/services/userApiService.ts`

**Functions to implement:**mplemented with GSI in backend for better performance

1. **createUser()** - POST request to create user
2. **getUserById()** - GET request to fetch user
3. **updateUserLastLogin()** - PUT request to update timestamp

**See [Ticket 2A](./ticket-2a-frontend-api-service.md) for complete implementation.**

---

### Ticket 2B: Backend Steps

**Infrastructure to deploy:**

1. **DynamoDB table** (`speak-greek-now-users`)
2. **API Gateway** with three endpoints
3. **VTL templates** for request/response mapping
4. **API Key** for authentication
5. **CORS configuration** for frontend domain

## **See [Ticket 2B](./ticket-2b-backend-api-infrastructure.md) for complete CDK code.**

## 🧪 Testing & Verification

### Manual Testing

1. **Test User Creation:**

```typescript
import { createUser, getUserById } from '@/services/userApiService'; // Changed from dynamodbService

// Create test user
const user = await createUser({
  userId: 'test-google-id-123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
});

console.log('Created user:', user);
// Should show user with createdAt and lastLoginAt timestamps
```

2. **Test User Retrieval:**

```typescript
import { getUserById } from '@/services/userApiService';

const user = await getUserById('test-google-id-123');
console.log('Retrieved user:', user);
// Should show same user data
```

3. **Test Last Login Update:**

```typescript
import { updateUserLastLogin, getUserById } from '@/services/userApiService';

await updateUserLastLogin('test-google-id-123');
const user = await getUserById('test-google-id-123');
console.log('Updated lastLoginAt:', user?.lastLoginAt);
// Should show current timestamp
```

4. **Verify via API Gateway Console:**

- [ ] Open API Gateway console
- [ ] Test endpoints using API Gateway test feature
- [ ] Verify CloudWatch logs show successful API calls
- [ ] Check DynamoDB table in backend AWS account for data

### Build Verification

```bash
npm run tsc
npm run build
```

**All checks must pass:**

- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] No import errors

---

## 📝 Notes

- **Separation of Concerns:** Frontend (Next.js) only makes HTTP requests, backend (CDK) manages all database logic
- **Error handling:** Always wrap API calls in try/catch with proper network error handling
- **Performance:** Consider caching API responses for frequently accessed user data
- **Security:** Never expose API keys client-side - store in server-side environment variables only
- **VTL Templates:** Backend uses VTL (Velocity Template Language) for direct API Gateway → DynamoDB integration without Lambda
- **API Authentication:** Use API Key or IAM Signature V4 (coordinate with backend team)

---

## 🔗 Next Steps

After completing this ticket:

✅ **Completed:** Tickets 1-2  
➡️ **Next:** [Ticket 3: Google OAuth API Routes](./ticket-3-oauth-routes.md)

---

## 🆘 Troubleshooting

**"Unable to connect to API"**

- Verify `NEXT_PUBLIC_USER_API_URL` is set correctly in environment variables
- Check API Gateway endpoint is deployed and accessible
- Verify CORS configuration on API Gateway allows your frontend domain
- In local development, test API endpoint with curl or Postman first

**"401 Unauthorized"**

- Verify `USER_API_KEY` environment variable is set correctly
- Check API Key is valid and not expired in API Gateway console
- Ensure API Key is passed in correct header (typically `x-api-key`)

**"403 Forbidden" or CORS errors**

- Verify API Gateway CORS configuration includes your frontend domain
- Check that OPTIONS requests are handled by API Gateway
- Ensure response headers include `Access-Control-Allow-Origin`

**"404 Not Found" for existing users**

- Verify API Gateway endpoints are deployed to correct stage
- Check VTL templates in backend are correctly mapping to DynamoDB table
- Ensure `userId` parameter is correctly passed in URL path

**"Network request failed"**

- Check internet connectivity
- Verify API Gateway endpoint URL is publicly accessible
- Test with curl: `curl -H "x-api-key: YOUR_KEY" https://YOUR_API_URL/users/test-id`
  - `dynamodb:GetItem`
  - `dynamodb:UpdateItem`
  - `dynamodb:Scan` (for getUserByEmail)
- Ensure the Resource ARN in the policy matches your table
- Check that the IAM role is properly attached to the Amplify app
- For local development, ensure your AWS CLI profile has DynamoDB permissions

---

## **Status:** Ready for implementation ✅

## ✅ Combined Acceptance Criteria

### Ticket 2A (Frontend) - See detailed criteria in ticket

- [ ] `src/services/userApiService.ts` implemented
- [ ] `src/lib/dal.ts` updated to use API service
- [ ] Environment variables configured
- [ ] TypeScript compilation passes
- [ ] Next.js build passes

### Ticket 2B (Backend) - See detailed criteria in ticket

- [ ] DynamoDB table deployed
- [ ] API Gateway REST API deployed
- [ ] VTL templates working correctly
- [ ] API Key created and retrieved
- [ ] CORS configured for frontend domain
- [ ] All curl tests passing

### Integration Testing (Both Complete)

- [ ] Frontend can create users via API
- [ ] Frontend can retrieve users via API
- [ ] Frontend can update last login via API
- [ ] 404 responses handled correctly
- [ ] Error messages are descriptive
- [ ] CORS allows frontend requests## 🧪 Testing & Verification

### Frontend Testing (Ticket 2A)

**See [Ticket 2A Testing Section](./ticket-2a-frontend-api-service.md#-testing--verification) for:**

- Manual testing with test scripts
- Build verification steps
- Error handling tests

### Backend Testing (Ticket 2B)

**See [Ticket 2B Testing Section](./ticket-2b-backend-api-infrastructure.md#-testing--verification) for:**

- curl command tests
- AWS Console verification
- CORS testing
- VTL template validation

### End-to-End Integration Testing

**After both tickets complete:**

1. Frontend makes request → API Gateway → DynamoDB
2. Verify user creation flow works
3. Verify user retrieval flow works
4. Verify last login update works
5. Verify error handling (404, 401, network errors)## 🔗 Next Steps

After completing **both** Ticket 2A and 2B:

✅ **Completed:** Tickets 1, 2A, 2B  
➡️ **Next:** [Ticket 3: Google OAuth API Routes](./ticket-3-oauth-routes.md)

**Handoff between tickets:**

- Ticket 2B team provides API URL and API Key to Ticket 2A team
- Ticket 2A team configures environment variables
- Integration testing verifies both work together---

## 📊 Progress Tracking

Mark sub-tickets as complete:

- [ ] **Ticket 2A** - Frontend API Service ([Details](./ticket-2a-frontend-api-service.md))
- [ ] **Ticket 2B** - Backend Infrastructure ([Details](./ticket-2b-backend-api-infrastructure.md))

**When both are complete, this ticket (Ticket 2) is complete.**

---

**Status:** Split into sub-tickets - See 2A and 2B for implementation details ✅
