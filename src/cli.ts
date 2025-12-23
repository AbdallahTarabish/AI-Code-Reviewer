#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { prompt } from 'enquirer';
import configManager from './utils/configManager';
import GitHubService from './services/github';
import AnalyzerService from './services/analyzer';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

// Logger utilities
const logger = {
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  warning: (msg: string) => console.warn(`⚠️  ${msg}`),
};

program
  .name('ai-code-reviewer')
  .version(pkg.version)
  .description('AI-powered code review tool for GitHub PRs');

// Authentication Commands
program
  .command('login')
  .description('Authenticate with GitHub')
  .action(async () => {
    try {
      logger.info('Starting GitHub authentication...');
      const success = await configManager.authenticate();
      if (success) {
        const token = configManager.getGitHubToken();
        if (token) {
          const verified = await configManager.verifyToken(token);
          if (verified) {
            logger.success('Authentication successful!');
          }
        }
      } else {
        logger.error('Authentication failed');
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Authentication failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Remove GitHub authentication')
  .action(() => {
    configManager.clear();
    logger.success('Successfully logged out');
  });

program
  .command('config')
  .description('Display current configuration')
  .action(() => {
    configManager.printConfig();
  });

program
  .command('verify-token')
  .description('Verify the stored GitHub token')
  .action(async () => {
    try {
      configManager.load();
      const token = configManager.getGitHubToken();
      if (!token) {
        logger.error('No GitHub token found. Please run "login" first.');
        process.exit(1);
      }
      const verified = await configManager.verifyToken(token);
      if (!verified) {
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Token verification failed: ${error}`);
      process.exit(1);
    }
  });

// Repository Commands
program
  .command('repo:info <repoUrl>')
  .description('Get information about a GitHub repository')
  .action(async (repoUrl) => {
    try {
      configManager.load();
      const token = configManager.getGitHubToken();
      if (!token) {
        logger.error('No GitHub token found. Please run "login" first.');
        process.exit(1);
      }

      const githubService = new GitHubService(token);
      logger.info(`Fetching repository info for ${repoUrl}...`);
      const info = await githubService.getRepositoryInfo(repoUrl);

      console.log('\n📦 Repository Information:');
      console.log(`  Owner: ${info.owner}`);
      console.log(`  Name: ${info.name}`);
      console.log(`  Description: ${info.description || 'N/A'}`);
      console.log(`  URL: ${info.url}`);
      console.log(`  Stars: ⭐ ${info.stars}`);
      console.log(`  Language: ${info.language || 'N/A'}`);
      console.log(`  Private: ${info.private ? '🔒 Yes' : '🔓 No'}`);
      console.log(`  Default Branch: ${info.default_branch}\n`);
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program
  .command('repo:branches <repoUrl>')
  .description('List branches in a GitHub repository')
  .action(async (repoUrl) => {
    try {
      configManager.load();
      const token = configManager.getGitHubToken();
      if (!token) {
        logger.error('No GitHub token found. Please run "login" first.');
        process.exit(1);
      }

      const githubService = new GitHubService(token);
      logger.info(`Fetching branches for ${repoUrl}...`);
      const branches = await githubService.listBranches(repoUrl);

      console.log(`\n📚 Branches (${branches.length}):`);
      branches.forEach((branch) => {
        const protection = branch.protected ? ' 🔒 (protected)' : '';
        console.log(`  • ${branch.name}${protection}`);
      });
      console.log();
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

// PR Commands
program
  .command('pr:info <repoUrl> <prNumber>')
  .description('Get information about a specific pull request')
  .action(async (repoUrl, prNumber) => {
    try {
      configManager.load();
      const token = configManager.getGitHubToken();
      if (!token) {
        logger.error('No GitHub token found. Please run "login" first.');
        process.exit(1);
      }

      const githubService = new GitHubService(token);
      logger.info(`Fetching PR #${prNumber} info...`);
      const prInfo = await githubService.getPRInfo(repoUrl, parseInt(prNumber, 10));

      console.log(`\n📝 Pull Request Information:`);
      console.log(`  Number: #${prInfo.number}`);
      console.log(`  Title: ${prInfo.title}`);
      console.log(`  Author: ${prInfo.author}`);
      console.log(`  State: ${prInfo.state}`);
      console.log(`  Created: ${new Date(prInfo.created_at).toLocaleString()}`);
      console.log(`  Updated: ${new Date(prInfo.updated_at).toLocaleString()}`);
      console.log(`  Additions: ${prInfo.additions}`);
      console.log(`  Deletions: ${prInfo.deletions}`);
      console.log(`  Changed Files: ${prInfo.changed_files}`);
      console.log(`  URL: ${prInfo.html_url}`);
      if (prInfo.description) {
        console.log(`\n  Description:\n    ${prInfo.description.substring(0, 200)}${prInfo.description.length > 200 ? '...' : ''}`);
      }
      console.log();
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

// Analysis Commands
program
  .command('analyze <repoUrl> <prNumber>')
  .description('Analyze a pull request with AI code review')
  .option('--ai-key <key>', 'AI API Key (OpenRouter or OpenAI)')
  .option('--ai-model <model>', 'AI Model to use', 'deepseek/deepseek-chat-v3-0324')
  .option('--ai-base-url <url>', 'AI API Base URL', 'https://openrouter.ai/api/v1')
  .action(async (repoUrl, prNumber, options) => {
    try {
      configManager.load();
      const githubToken = configManager.getGitHubToken();
      if (!githubToken) {
        logger.error('No GitHub token found. Please run "login" first.');
        process.exit(1);
      }

      let aiKey = options.aiKey || configManager.getApiKey();
      if (!aiKey) {
        const answers: any = await prompt([
          {
            type: 'password',
            name: 'aiKey',
            message: 'Enter your OpenRouter or OpenAI API Key:',
          },
        ]);
        aiKey = answers.aiKey;

        if (!aiKey) {
          logger.error('AI API Key is required');
          process.exit(1);
        }
      }

      // Parse repo URL
      let owner: string, repo: string;
      if (repoUrl.includes('github.com')) {
        const parts = repoUrl.replace(/\.git$/, '').split('/');
        owner = parts[parts.length - 2];
        repo = parts[parts.length - 1];
      } else {
        const parts = repoUrl.split('/');
        owner = parts[0];
        repo = parts[1];
      }

      logger.info(`Starting analysis of ${owner}/${repo}#${prNumber}...`);
      const analyzer = new AnalyzerService(
        githubToken,
        aiKey,
        options.aiModel,
        options.aiBaseUrl
      );

      const result = await analyzer.analyzePR(owner, repo, parseInt(prNumber, 10));

      if (result.success) {
        console.log('\n✅ Analysis Complete!');
        console.log(`  Repository: ${result.repository}`);
        console.log(`  PR Number: #${result.prNumber}`);
        console.log(`  Files Analyzed: ${result.totalFilesAnalyzed}`);
        console.log(`  Issues Found: ${result.totalComments}`);

        if (result.comments.length > 0) {
          console.log('\n📌 Issues:');
          result.comments.forEach((comment, index) => {
            console.log(`  ${index + 1}. [${comment.file}:${comment.line}]`);
            console.log(`     ${comment.comment}\n`);
          });
        }
      } else {
        logger.error('Analysis failed');
        if (result.errors?.length) {
          console.log('Errors:');
          result.errors.forEach((error) => console.log(`  • ${error}`));
        }
        process.exit(1);
      }
    } catch (error: any) {
      logger.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
} else {
  program.parse(process.argv);
}
