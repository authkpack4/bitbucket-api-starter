# Bitbucket API Starter

TypeScript client for Bitbucket API with repositories, pull requests, and issues management.

## Features

- ✅ TypeScript client for Bitbucket API
- ✅ Repository management
- ✅ Pull requests (CRUD operations)
- ✅ Issues tracking
- ✅ User profile and workspaces
- ✅ Type-safe interfaces
- ✅ Error handling

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Add your Bitbucket credentials:
   - `BITBUCKET_USERNAME` - Your Bitbucket username
   - `BITBUCKET_APP_PASSWORD` - Your app password
   - `BITBUCKET_WORKSPACE` - Your workspace name

```bash
cp .env.example .env
```

## Usage

```typescript
import { BitbucketClient } from './src/bitbucket-client';

const client = new BitbucketClient(
  process.env.BITBUCKET_USERNAME!,
  process.env.BITBUCKET_APP_PASSWORD!,
  process.env.BITBUCKET_WORKSPACE!
);

// Get repositories
const repos = await client.getRepositories();
console.log('Repositories:', repos);

// Create pull request
const pr = await client.createPullRequest(
  'Feature branch PR',
  'feature-branch',
  'main',
  'This adds new features'
);

console.log('Created PR:', pr);
```

## API Methods

### Repositories
- `getRepositories()` - Get all repositories
- `getRepository(repoName)` - Get specific repository
- `createRepository(name, options)` - Create new repository

### Pull Requests
- `getPullRequests(repoName)` - Get all pull requests
- `getPullRequest(prId, repoName)` - Get specific PR
- `createPullRequest(title, source, dest, desc, repoName)` - Create PR

### Issues
- `getIssues(repoName)` - Get all issues
- `getIssue(issueId, repoName)` - Get specific issue
- `createIssue(title, content, priority, repoName)` - Create issue

### User & Workspace
- `getUserProfile()` - Get user profile
- `getUserEmails()` - Get user emails
- `getWorkspaces()` - Get all workspaces
- `getWorkspaceMembers()` - Get workspace members

## Development

```bash
npm run dev    # Development mode
npm run build  # Build for production
npm start      # Run production version
```

## Authentication

1. Go to Bitbucket Settings > Personal Bitbucket settings
2. Navigate to App passwords
3. Create a new App password with repositories:write scope
4. Use your username and app password in .env

## Examples

```typescript
// Get user profile
const profile = await client.getUserProfile();

// List repositories
const repos = await client.getRepositories();

// Create issue
const issue = await client.createIssue(
  'Bug: Fix login error',
  'Users cannot login with special characters',
  'HIGH'
);

// Create pull request
const pr = await client.createPullRequest(
  'Add user authentication',
  'feature/auth',
  'main',
  'Implements JWT authentication system'
);
```

## Rate Limits

Bitbucket API has rate limits:
- 1000 requests per hour for authenticated users
- Lower limits for unauthenticated requests

## Error Handling

```typescript
try {
  const repos = await client.getRepositories();
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Authentication failed');
  } else if (error.response?.status === 403) {
    console.log('Insufficient permissions');
  } else {
    console.log('API Error:', error.message);
  }
}
```

## License

MIT
