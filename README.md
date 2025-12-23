# 🤖 AI Code Reviewer CLI

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![CLI Tool](https://img.shields.io/badge/CLI-Tool-green?style=flat-square)](CLI_GUIDE.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen?style=flat-square)](https://nodejs.org/)

AI-powered code review tool for GitHub Pull Requests. Analyze PRs locally, manage GitHub tokens, and get repository insights - all from your command line.

## ✨ Features

- 💻 **Full-Featured CLI**: Complete command-line interface for local PR analysis
- 🔐 **Secure Token Management**: Store and verify GitHub credentials locally
- 🧠 **Multi-Model Support**: Works with 100+ AI models via OpenRouter or OpenAI
- 🎯 **Intelligent Reviews**: AI-powered code analysis with specific feedback
- 📊 **Repository Insights**: Get repo info, branches, and PR details instantly
- 🚀 **High Performance**: Handles large PRs with intelligent batching
- 🛡️ **Error Resilient**: Robust error handling and recovery

## 🚀 Quick Start

### Installation

```bash
# Clone or navigate to the repository
cd ai-codereviewer

# Install dependencies
npm install

# Build the project
npm run build

# Make CLI globally available (optional)
npm link
```

### First-Time Setup

**1. Get Your GitHub Token**

Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)

Generate a new token with these scopes:
- ✅ `repo` (Full control of private repositories)
- ✅ `read:user` (Read user profile data)

**2. Authenticate**

```bash
ai-code-reviewer login
# Enter your GitHub token when prompted
```

**3. Verify Setup**

```bash
ai-code-reviewer config
ai-code-reviewer verify-token
```

### Your First PR Analysis

```bash
# Get PR information
ai-code-reviewer pr:info owner/repo 123

# Analyze with AI (you'll need an API key)
ai-code-reviewer analyze owner/repo 123 \
  --ai-key your-openrouter-key \
  --ai-model deepseek/deepseek-chat-v3-0324
```

## 📖 Available Commands

### Authentication & Configuration

```bash
# Authenticate with GitHub
ai-code-reviewer login

# View current configuration
ai-code-reviewer config

# Verify your GitHub token
ai-code-reviewer verify-token

# Logout (remove stored credentials)
ai-code-reviewer logout
```

### Repository Operations

```bash
# Get repository information
ai-code-reviewer repo:info <owner/repo>
ai-code-reviewer repo:info microsoft/vscode

# List all branches
ai-code-reviewer repo:branches <owner/repo>
ai-code-reviewer repo:branches facebook/react
```

### Pull Request Operations

```bash
# Get PR details and statistics
ai-code-reviewer pr:info <owner/repo> <pr-number>
ai-code-reviewer pr:info vercel/next.js 45678

# Analyze PR with AI code review
ai-code-reviewer analyze <owner/repo> <pr-number> [options]
```

### Analyze Command Options

```bash
ai-code-reviewer analyze <owner/repo> <pr-number> \
  --ai-key <your-api-key>              # Required: AI API key
  --ai-model <model-name>              # Optional: AI model to use
  --ai-base-url <api-url>              # Optional: Custom API endpoint
```

## 🎯 Usage Examples

### Example 1: Repository Information

```bash
ai-code-reviewer repo:info microsoft/vscode
```

Output:
```
📦 Repository Information:
  Owner: microsoft
  Name: vscode
  Description: Visual Studio Code
  URL: https://github.com/microsoft/vscode
  Stars: ⭐ 150000
  Language: TypeScript
  Private: 🔓 No
  Default Branch: main
```

### Example 2: List Branches

```bash
ai-code-reviewer repo:branches facebook/react
```

Output:
```
📚 Branches (15):
  • main
  • dev 🔒 (protected)
  • feature/new-hooks
  • bugfix/memory-leak
  ...
```

### Example 3: Get PR Information

```bash
ai-code-reviewer pr:info vercel/next.js 45678
```

Output:
```
📝 Pull Request Information:
  Number: #45678
  Title: Add new image optimization
  Author: username
  State: open
  Created: 12/20/2024, 3:45 PM
  Updated: 12/22/2024, 10:30 AM
  Additions: 245
  Deletions: 89
  Changed Files: 12
  URL: https://github.com/vercel/next.js/pull/45678
```

### Example 4: Analyze PR with OpenRouter

```bash
ai-code-reviewer analyze owner/repo 123 \
  --ai-key sk-or-v1-xxxxxxxxxxxxx \
  --ai-model deepseek/deepseek-chat-v3-0324
```

### Example 5: Analyze PR with OpenAI

```bash
ai-code-reviewer analyze owner/repo 123 \
  --ai-key sk-xxxxxxxxxxxxxxx \
  --ai-model gpt-4 \
  --ai-base-url https://api.openai.com/v1
```

## 🤖 AI Provider Setup

### Option A: OpenRouter (Recommended)

**Why OpenRouter?**
- 100+ models available (DeepSeek, Claude, GPT-4, Gemini, Llama)
- More cost-effective than direct API access
- No rate limits per model
- Simple unified API

**Setup:**
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Use with `--ai-key` flag

**Recommended Models:**
```bash
# Best value: Fast and cheap
--ai-model deepseek/deepseek-chat-v3-0324

# High quality options
--ai-model anthropic/claude-3-sonnet
--ai-model openai/gpt-4-turbo
--ai-model google/gemini-2.0-flash-exp
```

### Option B: OpenAI Direct

**Setup:**
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Generate API key
3. Use with custom base URL

**Models:**
```bash
--ai-model gpt-4o           # Latest GPT-4
--ai-model gpt-4-turbo      # High performance
--ai-model gpt-4o-mini      # Cost-effective
```

## ⚙️ Configuration
## ⚙️ Configuration

### Configuration File

Credentials are stored in: `~/.ai-code-reviewer/config.json`

```json
{
  "githubToken": "ghp_xxxxxxxxxxxxx",
  "openrouterApiKey": "sk-or-v1-xxxxxxxxxxxxx",
  "openaiApiKey": "sk-xxxxxxxxxxxxx",
  "lastUpdated": "2024-12-23T10:30:00.000Z"
}
```

### Environment Variables (Alternative)

You can also use environment variables instead of stored config:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
export OPENROUTER_API_MODEL=deepseek/deepseek-chat-v3-0324
```

## 🛠️ Troubleshooting

### Common Issues

**"No GitHub token found"**
```bash
ai-code-reviewer login
```

**"Token verification failed"**
```bash
# Re-authenticate
ai-code-reviewer logout
ai-code-reviewer login
ai-code-reviewer verify-token
```

**"CLI command not found after npm link"**
```bash
# Unlink and relink
npm unlink
npm link

# Or use directly without linking
node lib/cli.js <command>
npx ts-node src/cli.ts <command>
```

**"Invalid repository URL"**
- Use format: `owner/repo` or `https://github.com/owner/repo`
- Example: `microsoft/vscode` or `https://github.com/microsoft/vscode`

**"PR not found"**
- Verify the PR number is correct
- Ensure you have access to the repository
- Check your GitHub token has proper permissions

**Build errors**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 How It Works

1. **Authentication**: CLI uses your GitHub token to access repositories
2. **Fetch**: Retrieves PR diff and file changes via GitHub API
3. **Analysis**: Sends code to AI model for intelligent review
4. **Results**: Displays issues found with file names and line numbers
5. **Local Storage**: Saves configuration securely in your home directory

## 🔍 Advanced Features

### Large PR Support
- Handles PRs up to GitHub's limits (20,000+ lines)
- Intelligent batching for optimal performance
- Progress tracking and resume capability

### Multiple AI Providers
- OpenRouter: 100+ models
- OpenAI: GPT models
- Custom: Any OpenAI-compatible API

### Smart Analysis
- Detects bugs and potential issues
- Suggests code quality improvements
- Identifies security vulnerabilities
- Recommends best practices

## 💡 Tips & Best Practices

1. **Use DeepSeek for Cost-Effective Reviews**
   ```bash
   --ai-model deepseek/deepseek-chat-v3-0324
   ```
   Fast, accurate, and very affordable

2. **Check PR Info Before Analyzing**
   ```bash
   ai-code-reviewer pr:info owner/repo 123
   ```
   Verify PR size and changes before running expensive AI analysis

3. **Store API Keys Securely**
   - Don't commit API keys to repositories
   - Use environment variables in CI/CD
   - Store locally for development

4. **Verify Token Regularly**
   ```bash
   ai-code-reviewer verify-token
   ```
   Ensure your GitHub token is valid

5. **Use Repository Shortcuts**
   ```bash
   # Both formats work
   ai-code-reviewer repo:info owner/repo
   ai-code-reviewer repo:info https://github.com/owner/repo
   ```

## 📚 Additional Documentation

- **[CLI_GUIDE.md](CLI_GUIDE.md)** - Complete CLI reference with all commands and examples
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference card
- **[UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)** - Migration guide from older versions

## 🎯 Real-World Workflows

### Daily Development Workflow

```bash
# Morning: Check what's new
ai-code-reviewer repo:branches owner/repo

# Review a colleague's PR
ai-code-reviewer pr:info owner/repo 456
ai-code-reviewer analyze owner/repo 456 --ai-key $OPENROUTER_KEY

# Quick repo check
ai-code-reviewer repo:info owner/repo
```

### Code Review Session

```bash
# 1. List recent PRs (use GitHub web for this)
# 2. Get details
ai-code-reviewer pr:info owner/repo 123

# 3. Analyze if needed
ai-code-reviewer analyze owner/repo 123 \
  --ai-key $OPENROUTER_KEY \
  --ai-model deepseek/deepseek-chat-v3-0324

# 4. Review output and provide feedback
```

### Repository Audit

```bash
# Check repository health
ai-code-reviewer repo:info owner/repo

# Review branch structure
ai-code-reviewer repo:branches owner/repo

# Analyze key PRs
ai-code-reviewer pr:info owner/repo 100
ai-code-reviewer pr:info owner/repo 200
```

## 🔐 Security

- **Token Storage**: Credentials stored in `~/.ai-code-reviewer/config.json` (600 permissions recommended)
- **API Keys**: Never logged or exposed in output
- **GitHub Access**: Only requests necessary permissions
- **Local Processing**: Analysis happens locally, not on external servers

## 🤝 Contributing

Contributions welcome! This is an open-source project.

**Ways to contribute:**
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🆘 Support

- **Documentation**: Read [CLI_GUIDE.md](CLI_GUIDE.md) for detailed help
- **Issues**: [Open an issue](https://github.com/your-username/ai-codereviewer/issues) on GitHub
- **Questions**: Check existing issues or create a new one

## 🌟 Show Your Support

If you find this tool useful, please give it a ⭐ star on GitHub!

---

**Quick Command Reference:**

```bash
# Setup
ai-code-reviewer login

# Repository
ai-code-reviewer repo:info <owner/repo>
ai-code-reviewer repo:branches <owner/repo>

# Pull Request
ai-code-reviewer pr:info <owner/repo> <number>
ai-code-reviewer analyze <owner/repo> <number> --ai-key <key>

# Configuration
ai-code-reviewer config
ai-code-reviewer verify-token
ai-code-reviewer logout
```

*Made with ❤️ for developers who care about code quality*
