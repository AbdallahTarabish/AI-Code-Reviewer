# 🤖 AI Code Reviewer

AI Code Reviewer is a powerful GitHub Action that leverages cutting-edge AI models to provide intelligent, automated code reviews on your pull requests. Now with a built-in CLI for local development!

## 🚀 Quick Start

### GitHub Action (Recommended for CI/CD)

See [Quick Start Guide](README.md#github-action-setup)

### CLI (For Local Development & Manual Analysis)

```bash
# Install
npm install
npm run build
npm link

# Authenticate
ai-code-reviewer login

# Analyze a PR locally
ai-code-reviewer analyze owner/repo 123 --ai-key your-api-key
```

For detailed CLI usage, see [CLI_GUIDE.md](CLI_GUIDE.md)

## 🎯 Use Cases

1. **GitHub Actions**: Automated reviews on every PR (recommended)
2. **Local Development**: Analyze PRs before pushing
3. **Manual Reviews**: Review specific PRs on-demand
4. **Custom Workflows**: Integrate with your own scripts
5. **Repository Inspection**: Get info about repos and PRs

## 🚀 Quick Start

### 1. Choose Your AI Provider

#### Option A: OpenRouter (Recommended)
- More models available (DeepSeek, Claude, Gemini, etc.)
- Often more cost-effective
- Sign up at [OpenRouter](https://openrouter.ai/)

#### Option B: OpenAI Direct
- Direct access to GPT models
- Sign up at [OpenAI](https://platform.openai.com/)

### 2. Set Up Repository Secrets

Go to your repository → Settings → Secrets and variables → Actions, then add:

**For Personal Attribution (Recommended):**
- `PERSONAL_GITHUB_TOKEN`: Your personal access token with `repo` and `pull_requests` scopes

**For AI Provider:**
- `OPENROUTER_API_KEY`: Your OpenRouter API key, OR
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Create Workflow File

Create `.github/workflows/ai-code-review.yml`:

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]
permissions: write-all

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: AI Code Review
        uses: your-username/ai-codereviewer@main
        with:
          # Use personal token for reviews under your name
          GITHUB_TOKEN: ${{ secrets.PERSONAL_GITHUB_TOKEN }}
          
          # OpenRouter (recommended)
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          OPENROUTER_API_MODEL: "deepseek/deepseek-chat-v3-0324"
          
          # OR OpenAI Direct
          # OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          # OPENAI_API_MODEL: "gpt-4"
          
          # Optional: exclude files
          exclude: "*.md,*.json,dist/**,node_modules/**"
```

## 🎛️ Configuration Options

### Input Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `GITHUB_TOKEN` | GitHub token for API access | ✅ | - |
| `OPENROUTER_API_KEY` | OpenRouter API key | ⚠️* | - |
| `OPENROUTER_API_MODEL` | OpenRouter model name | ❌ | `deepseek/deepseek-chat-v3-0324` |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL | ❌ | `https://openrouter.ai/api/v1` |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️* | - |
| `OPENAI_API_MODEL` | OpenAI model name | ❌ | `gpt-4` |
| `exclude` | File patterns to exclude | ❌ | `""` |

*Either OpenRouter or OpenAI credentials required

### Recommended Models

#### OpenRouter Models (Cost-Effective)
```yaml
# Best Performance/Cost Ratio
OPENROUTER_API_MODEL: "deepseek/deepseek-chat-v3-0324"

# High Quality Options
OPENROUTER_API_MODEL: "anthropic/claude-3-sonnet"
OPENROUTER_API_MODEL: "google/gemini-2.0-flash-exp"
OPENROUTER_API_MODEL: "meta-llama/llama-3.1-70b-instruct"
```

#### OpenAI Models
```yaml
OPENAI_API_MODEL: "gpt-4o"           # Latest GPT-4
OPENAI_API_MODEL: "gpt-4o-mini"     # Cost-effective
OPENAI_API_MODEL: "gpt-4-turbo"     # High performance
```

## 🔧 Advanced Setup

### CLI Usage (New!)

The AI Code Reviewer now includes a full-featured CLI for local development and manual PR analysis.

#### Installation

```bash
# Install dependencies
npm install
npm run build

# Make available globally
npm link
```

#### Basic Commands

```bash
# Authenticate with GitHub
ai-code-reviewer login

# Check configuration
ai-code-reviewer config

# Verify your token
ai-code-reviewer verify-token

# Get repository information
ai-code-reviewer repo:info owner/repo

# List repository branches
ai-code-reviewer repo:branches owner/repo

# Get PR information
ai-code-reviewer pr:info owner/repo 123

# Analyze a PR with AI
ai-code-reviewer analyze owner/repo 123 --ai-key your-api-key
```

For complete CLI documentation, see [CLI_GUIDE.md](CLI_GUIDE.md)

### Personal Token Setup (For Reviews Under Your Name)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `repo` (Full control of private repositories)
   - `pull_requests` (Access pull requests)
3. Add as `PERSONAL_GITHUB_TOKEN` secret in your repository

### File Exclusion Patterns

```yaml
# Exclude specific files and directories
exclude: "*.md,*.json,package-lock.json,yarn.lock,dist/**,build/**,node_modules/**"

# Exclude test files
exclude: "**/*.test.js,**/*.spec.ts,__tests__/**"

# Exclude generated files
exclude: "*.generated.*,**/generated/**,**/*.min.js"
```
## 📊 How It Works

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



*Star ⭐ this repo if you find it useful!*
