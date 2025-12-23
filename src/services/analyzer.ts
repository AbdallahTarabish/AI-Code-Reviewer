import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import parseDiff, { File as ParsedFile } from 'parse-diff';
import { minimatch } from 'minimatch';

interface AnalysisResult {
  success: boolean;
  prNumber: number;
  repository: string;
  totalFilesAnalyzed: number;
  totalComments: number;
  comments: Array<{
    file: string;
    line: number;
    comment: string;
  }>;
  errors?: string[];
}

class AnalyzerService {
  private octokit: Octokit;
  private openai: OpenAI;
  private apiModel: string;
  private excludePatterns: string[] = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.lock',
    '**/*.min.js',
    '**/coverage/**',
  ];

  constructor(
    githubToken: string,
    apiKey: string,
    apiModel: string = 'deepseek/deepseek-chat-v3-0324',
    apiBaseUrl: string = 'https://openrouter.ai/api/v1'
  ) {
    this.octokit = new Octokit({ auth: githubToken });
    this.apiModel = apiModel;
    this.openai = new OpenAI({
      apiKey,
      baseURL: apiBaseUrl,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/actions',
        'X-Title': 'AI Code Reviewer',
      },
    });
  }

  async analyzePR(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<AnalysisResult> {
    const result: AnalysisResult = {
      success: false,
      prNumber,
      repository: `${owner}/${repo}`,
      totalFilesAnalyzed: 0,
      totalComments: 0,
      comments: [],
      errors: [],
    };

    try {
      // Get PR details
      const { data: prData } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      console.log(`📋 Analyzing PR #${prNumber}: ${prData.title}`);

      // Get diff
      let diff: string;
      try {
        const diffResponse = await this.octokit.pulls.get({
          owner,
          repo,
          pull_number: prNumber,
          mediaType: { format: 'diff' },
        });
        // @ts-expect-error
        diff = diffResponse.data;
      } catch (error: any) {
        if (error.response?.status === 406) {
          console.log('⚠️  Diff too large, fetching files individually...');
          diff = await this.getIndividualFileDiffs(owner, repo, prNumber);
        } else {
          throw error;
        }
      }

      if (!diff || diff.trim() === '') {
        result.success = true;
        result.totalComments = 0;
        return result;
      }

      // Parse diff
      const parsedDiff = parseDiff(diff);

      // Filter files
      const filteredDiff = parsedDiff.filter(
        (file) => !this.isExcluded(file.to || file.from || '')
      );

      console.log(`📁 Found ${filteredDiff.length} files to analyze`);

      result.totalFilesAnalyzed = filteredDiff.length;

      // Analyze code
      for (const file of filteredDiff) {
        try {
          const comments = await this.analyzeFile(file, prData.title, prData.body || '');
          result.comments.push(...comments);
        } catch (error: any) {
          const errorMsg = `Error analyzing ${file.to}: ${error.message}`;
          result.errors?.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      result.totalComments = result.comments.length;
      result.success = true;
    } catch (error: any) {
      result.success = false;
      result.errors?.push(error.message);
      console.error(`❌ Analysis failed: ${error.message}`);
    }

    return result;
  }

  private async analyzeFile(
    file: ParsedFile,
    prTitle: string,
    prDescription: string
  ): Promise<Array<{ file: string; line: number; comment: string }>> {
    const comments: Array<{ file: string; line: number; comment: string }> = [];

    if (
      !file.chunks ||
      file.chunks.length === 0 ||
      (file.to && file.to.includes('.lock'))
    ) {
      return comments;
    }

    const fileContent = file.chunks
      .map((chunk) => chunk.changes.map((c) => `${c.type}${c.content}`).join(''))
      .join('\n');

    const prompt = `Review the following code changes and provide specific, actionable feedback.
PR Title: ${prTitle}
PR Description: ${prDescription}

Code:
\`\`\`
${fileContent}
\`\`\`

Respond with a JSON object containing an array of reviews:
{
  "reviews": [
    {
      "lineNumber": <line_number>,
      "reviewComment": "<feedback>"
    }
  ]
}

Only include reviews for actual issues found. If no issues, respond with {"reviews": []}.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.apiModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });

      let content = response.choices[0]?.message?.content || '{}';
      
      // Strip markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON from text by finding the first { and last }
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        content = content.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(content);

      if (parsed.reviews && Array.isArray(parsed.reviews)) {
        for (const review of parsed.reviews) {
          comments.push({
            file: file.to || file.from || 'unknown',
            line: review.lineNumber,
            comment: review.reviewComment,
          });
        }
      }
    } catch (error: any) {
      // Silently skip files that can't be parsed - they may not need review
      // console.warn(`⚠️  Failed to analyze ${file.to}: ${error.message}`);
    }

    return comments;
  }

  private async getIndividualFileDiffs(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<string> {
    const { data: files } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    let combinedDiff = '';
    for (let i = 0; i < files.length; i += 10) {
      const batch = files.slice(i, i + 10);
      for (const file of batch) {
        if (file.patch) {
          combinedDiff += `diff --git a/${file.filename} b/${file.filename}\n${file.patch}\n`;
        }
      }
      if (i + 10 < files.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return combinedDiff;
  }

  private isExcluded(filename: string): boolean {
    return this.excludePatterns.some((pattern) => minimatch(filename, pattern));
  }
}

export default AnalyzerService;
