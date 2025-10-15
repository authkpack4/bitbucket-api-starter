import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface Repository {
  name: string;
  full_name: string;
  description?: string;
  is_private: boolean;
  owner: {
    username: string;
    display_name: string;
  };
  created_on: string;
  updated_on: string;
}

export interface PullRequest {
  id: number;
  title: string;
  description?: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED';
  author: {
    username: string;
    display_name: string;
  };
  created_on: string;
  updated_on: string;
  source: {
    branch: {
      name: string;
    };
    repository: {
      full_name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
    repository: {
      full_name: string;
    };
  };
}

export interface Issue {
  id: number;
  title: string;
  content?: string;
  state: 'NEW' | 'OPEN' | 'RESOLVED' | 'ON_HOLD' | 'INVALID' | 'DUPLICATE' | 'WONTFIX' | 'CLOSED';
  priority: 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';
  reporter: {
    username: string;
    display_name: string;
  };
  created_on: string;
  updated_on: string;
}

export class BitbucketClient {
  private client: AxiosInstance;
  private workspace: string;
  private repository?: string;

  constructor(username: string, appPassword: string, workspace: string, repository?: string) {
    this.workspace = workspace;
    this.repository = repository;

    this.client = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      auth: {
        username: username,
        password: appPassword,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  // Repositories
  async getRepositories(): Promise<Repository[]> {
    const response = await this.client.get(`/repositories/${this.workspace}`);
    return response.data.values;
  }

  async getRepository(repositoryName?: string): Promise<Repository> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.get(`/repositories/${this.workspace}/${repo}`);
    return response.data;
  }

  async createRepository(name: string, options: Partial<Repository> = {}): Promise<Repository> {
    const response = await this.client.post(`/repositories/${this.workspace}/${name}`, {
      name,
      description: options.description,
      is_private: options.is_private ?? false,
      fork_policy: 'allow_forks',
    });
    return response.data;
  }

  // Pull Requests
  async getPullRequests(repositoryName?: string): Promise<PullRequest[]> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.get(`/repositories/${this.workspace}/${repo}/pullrequests`);
    return response.data.values;
  }

  async createPullRequest(
    title: string,
    sourceBranch: string,
    destinationBranch: string,
    description?: string,
    repositoryName?: string
  ): Promise<PullRequest> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.post(`/repositories/${this.workspace}/${repo}/pullrequests`, {
      title,
      description,
      source: {
        branch: { name: sourceBranch },
        repository: { full_name: `${this.workspace}/${repo}` }
      },
      destination: {
        branch: { name: destinationBranch },
        repository: { full_name: `${this.workspace}/${repo}` }
      },
      close_source_branch: false,
    });
    return response.data;
  }

  async getPullRequest(prId: number, repositoryName?: string): Promise<PullRequest> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.get(`/repositories/${this.workspace}/${repo}/pullrequests/${prId}`);
    return response.data;
  }

  // Issues
  async getIssues(repositoryName?: string): Promise<Issue[]> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.get(`/repositories/${this.workspace}/${repo}/issues`);
    return response.data.values;
  }

  async createIssue(
    title: string,
    content: string,
    priority: Issue['priority'] = 'MAJOR',
    repositoryName?: string
  ): Promise<Issue> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.post(`/repositories/${this.workspace}/${repo}/issues`, {
      title,
      content: {
        raw: content,
        markup: 'markdown'
      },
      priority,
      kind: 'bug',
    });
    return response.data;
  }

  async getIssue(issueId: number, repositoryName?: string): Promise<Issue> {
    const repo = repositoryName || this.repository;
    if (!repo) throw new Error('Repository name is required');

    const response = await this.client.get(`/repositories/${this.workspace}/${repo}/issues/${issueId}`);
    return response.data;
  }

  // User Profile
  async getUserProfile(): Promise<any> {
    const response = await this.client.get('/user');
    return response.data;
  }

  async getUserEmails(): Promise<any[]> {
    const response = await this.client.get('/user/emails');
    return response.data.values;
  }

  // Workspaces
  async getWorkspaces(): Promise<any[]> {
    const response = await this.client.get('/workspaces');
    return response.data.values;
  }

  async getWorkspaceMembers(): Promise<any[]> {
    const response = await this.client.get(`/workspaces/${this.workspace}/members`);
    return response.data.values;
  }
}

// Usage example
export async function exampleUsage() {
  const client = new BitbucketClient(
    process.env.BITBUCKET_USERNAME!,
    process.env.BITBUCKET_APP_PASSWORD!,
    process.env.BITBUCKET_WORKSPACE!
  );

  try {
    // Get user profile
    const profile = await client.getUserProfile();
    console.log('Profile:', profile);

    // Get repositories
    const repos = await client.getRepositories();
    console.log('Repositories:', repos.slice(0, 3));

    if (repos.length > 0) {
      const repoName = repos[0].name;

      // Get pull requests for first repository
      const pullRequests = await client.getPullRequests(repoName);
      console.log('Pull Requests:', pullRequests.slice(0, 2));

      // Get issues for first repository
      const issues = await client.getIssues(repoName);
      console.log('Issues:', issues.slice(0, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}