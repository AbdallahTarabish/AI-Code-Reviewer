import { Octokit } from '@octokit/rest';

interface RepoInfo {
  owner: string;
  name: string;
  description?: string;
  url: string;
  stars: number;
  language?: string;
  private: boolean;
  default_branch: string;
}

interface PRInfo {
  number: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  author: string;
  additions: number;
  deletions: number;
  changed_files: number;
  html_url: string;
}

class GitHubService {
  private octokit: Octokit | null = null;

  constructor(token?: string) {
    if (token) {
      this.initialize(token);
    }
  }

  initialize(token: string): void {
    this.octokit = new Octokit({ auth: token });
  }

  private checkInitialized(): void {
    if (!this.octokit) {
      throw new Error('GitHub service not initialized. Please provide a token.');
    }
  }

  async getRepositoryInfo(repoUrl: string): Promise<RepoInfo> {
    this.checkInitialized();

    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);
      
      const { data } = await this.octokit!.repos.get({
        owner,
        repo,
      });

      return {
        owner: data.owner.login,
        name: data.name,
        description: data.description || undefined,
        url: data.html_url,
        stars: data.stargazers_count,
        language: data.language || undefined,
        private: data.private,
        default_branch: data.default_branch,
      };
    } catch (error: any) {
      throw new Error(`Failed to get repository info: ${error.message}`);
    }
  }

  async getPRInfo(repoUrl: string, prNumber: number): Promise<PRInfo> {
    this.checkInitialized();

    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);

      const { data } = await this.octokit!.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      return {
        number: data.number,
        title: data.title,
        description: data.body || '',
        state: data.state,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author: data.user?.login || 'Unknown',
        additions: data.additions,
        deletions: data.deletions,
        changed_files: data.changed_files,
        html_url: data.html_url,
      };
    } catch (error: any) {
      throw new Error(`Failed to get PR info: ${error.message}`);
    }
  }

  async listBranches(repoUrl: string): Promise<Array<{ name: string; protected: boolean }>> {
    this.checkInitialized();

    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);

      const { data } = await this.octokit!.repos.listBranches({
        owner,
        repo,
      });

      return data.map(branch => ({
        name: branch.name,
        protected: branch.protected,
      }));
    } catch (error: any) {
      throw new Error(`Failed to list branches: ${error.message}`);
    }
  }

  async getPRDiff(repoUrl: string, prNumber: number): Promise<string> {
    this.checkInitialized();

    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);

      const response = await this.octokit!.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: { format: 'diff' },
      });

      // @ts-expect-error - response.data is a string
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get PR diff: ${error.message}`);
    }
  }

  private parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
    // Handle URLs like: https://github.com/owner/repo or owner/repo
    let cleanUrl = repoUrl.replace(/\.git$/, '').trim();
    
    if (cleanUrl.includes('github.com')) {
      const parts = cleanUrl.split('/');
      const owner = parts[parts.length - 2];
      const repo = parts[parts.length - 1];
      return { owner, repo };
    } else if (cleanUrl.includes('/')) {
      const [owner, repo] = cleanUrl.split('/');
      return { owner, repo };
    }

    throw new Error(`Invalid repository URL format: ${repoUrl}`);
  }
}

export default GitHubService;
