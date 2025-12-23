import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { prompt } from 'enquirer';

interface ConfigData {
  githubToken?: string;
  openrouterApiKey?: string;
  openaiApiKey?: string;
  openrouterModel?: string;
  openaiModel?: string;
  openrouterBaseUrl?: string;
  lastUpdated?: string;
}

class ConfigManager {
  private configPath: string;
  private configData: ConfigData = {};

  constructor() {
    this.configPath = join(homedir(), '.ai-code-reviewer', 'config.json');
  }

  private ensureConfigDirectory(): void {
    const dir = join(homedir(), '.ai-code-reviewer');
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      const answers: any = await prompt([
        {
          type: 'password',
          name: 'githubToken',
          message: 'Enter your GitHub Personal Access Token (needs "repo" and "pull-request" scopes):',
          validate: (value: string) => {
            if (!value) return 'Token is required';
            if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
              return 'Invalid GitHub token format';
            }
            return true;
          }
        }
      ]);

      this.ensureConfigDirectory();
      this.configData = this.load();
      this.configData.githubToken = answers.githubToken;
      this.configData.lastUpdated = new Date().toISOString();
      this.save();

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.users.getAuthenticated();
      console.log(`✅ Token verified for user: ${data.login}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Token verification failed: ${error.message}`);
      return false;
    }
  }

  load(): ConfigData {
    try {
      if (existsSync(this.configPath)) {
        const data = readFileSync(this.configPath, 'utf8');
        this.configData = JSON.parse(data);
        return this.configData;
      }
    } catch (error) {
      console.warn('Failed to load config:', error);
    }
    return {};
  }

  save(): void {
    this.ensureConfigDirectory();
    writeFileSync(this.configPath, JSON.stringify(this.configData, null, 2));
  }

  setGitHubToken(token: string): void {
    this.configData.githubToken = token;
    this.configData.lastUpdated = new Date().toISOString();
    this.save();
  }

  setOpenrouterApiKey(key: string): void {
    this.configData.openrouterApiKey = key;
    this.configData.lastUpdated = new Date().toISOString();
    this.save();
  }

  setOpenaiApiKey(key: string): void {
    this.configData.openaiApiKey = key;
    this.configData.lastUpdated = new Date().toISOString();
    this.save();
  }

  getGitHubToken(): string | undefined {
    return this.configData.githubToken || process.env.GITHUB_TOKEN;
  }

  getOpenrouterApiKey(): string | undefined {
    return this.configData.openrouterApiKey || process.env.OPENROUTER_API_KEY;
  }

  getOpenaiApiKey(): string | undefined {
    return this.configData.openaiApiKey || process.env.OPENAI_API_KEY;
  }

  getApiKey(): string | undefined {
    return this.getOpenrouterApiKey() || this.getOpenaiApiKey();
  }

  getConfig(): ConfigData {
    return this.configData;
  }

  clear(): void {
    this.configData = {};
    if (existsSync(this.configPath)) {
      require('fs').unlinkSync(this.configPath);
    }
  }

  printConfig(): void {
    this.load();
    console.log('\n📋 Current Configuration:');
    console.log(`  GitHub Token: ${this.configData.githubToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`  OpenRouter API Key: ${this.configData.openrouterApiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`  OpenAI API Key: ${this.configData.openaiApiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`  Last Updated: ${this.configData.lastUpdated || 'Never'}\n`);
  }
}

export default new ConfigManager();
