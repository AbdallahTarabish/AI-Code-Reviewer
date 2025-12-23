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

1. **Trigger**: Action runs on PR open/update
2. **Fetch**: Retrieves PR diff and file changes
3. **Filter**: Applies exclusion patterns
4. **Process**: Sends code chunks to AI model
5. **Review**: AI analyzes code for:
   - Bugs and potential issues
   - Code quality improvements
   - Best practice suggestions
   - Security vulnerabilities
6. **Comment**: Posts review comments on specific lines

## 🔍 Features Deep Dive

### Large PR Support
- **Progress Tracking**: Saves progress for large PRs
- **Resume Capability**: Continues from where it left off
- **Batch Processing**: Handles files in manageable batches
- **Memory Efficient**: Processes files individually

### Error Handling
- **Response Format Detection**: Handles various AI model response formats
- **JSON Parsing**: Robust parsing with multiple fallbacks
- **Rate Limit Handling**: Automatic retry with backoff
- **Partial Response Recovery**: Extracts useful content from truncated responses

### Model Compatibility
- **OpenAI Models**: GPT-3.5, GPT-4, GPT-4 Turbo
- **Anthropic Models**: Claude 3 (Opus, Sonnet, Haiku)
- **Google Models**: Gemini Pro, Gemini Flash
- **Meta Models**: Llama 3.1 series
- **DeepSeek Models**: DeepSeek Chat v3
- **And 100+ more via OpenRouter**

## 🛠️ Troubleshooting

### Common Issues

**Reviews appear as "github-actions[bot]"**
- Use `PERSONAL_GITHUB_TOKEN` instead of `GITHUB_TOKEN`

**JSON parsing errors**
- Usually resolved automatically with built-in fallbacks
- Check model compatibility

**Rate limiting**
- Built-in retry mechanism handles this automatically
- Consider using OpenRouter for higher limits

**Large PR timeouts**
- Progress is automatically saved and resumed
- Use file exclusion patterns to reduce scope

**CLI token issues**
- Run `ai-code-reviewer logout` then `ai-code-reviewer login` to re-authenticate
- Check `~/.ai-code-reviewer/config.json` exists

### Debug Mode

Enable detailed logging by setting environment variable:
```yaml
env:
  DEBUG: "true"
```

## 📈 Performance Tips

1. **Use Exclusion Patterns**: Skip unnecessary files (docs, configs, lockfiles)
2. **Choose Efficient Models**: DeepSeek is fast and cost-effective
3. **Limit PR Size**: Keep PRs under 20,000 lines when possible
4. **Personal Tokens**: Use personal tokens to avoid rate limits

## 🧪 Local Testing

### Using CLI
```bash
# Authenticate
ai-code-reviewer login

# Test repository access
ai-code-reviewer repo:info owner/repo

# Test PR retrieval
ai-code-reviewer pr:info owner/repo 123

# Perform analysis
ai-code-reviewer analyze owner/repo 123
```

### Using Environment Variables
```bash
# Create .env file
cp .env.example .env

# Edit .env with your tokens
GITHUB_TOKEN=ghp_xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Run local test
npm install
npm run build
npm run test:local
```

## 📚 Documentation

- **[CLI_GUIDE.md](CLI_GUIDE.md)** - Complete CLI reference and examples
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference
- **[UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)** - Migration guide from older versions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🌟 Support

If you find this project helpful, please give it a ⭐ star!

For issues and feature requests, please [open an issue](https://github.com/your-username/ai-codereviewer/issues).

---

*Made with ❤️ for better code reviews*
