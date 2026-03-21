import type { FolderItem, FunctionItem, RepoAnalysis } from '../types';
import type { GitHubTreeItem } from './github';

// ── API Keys (build-time only — never exposed in UI) ──────────────────────────
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || '';

// ── Groq ──────────────────────────────────────────────────────────────────────
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

async function callGroq(prompt: string): Promise<string> {
  let lastError = '';
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert software engineer who analyzes GitHub repositories. Always respond with valid JSON only — no markdown, no code fences, no extra text.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errObj = errBody?.error as Record<string, unknown> | undefined;
        const msg = (errObj?.message as string) || `AI service error ${res.status}`;
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Auth error: ${msg}`);
        }
        lastError = msg;
        continue;
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from AI. Please try again.');
      return text;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Auth error')) throw e;
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Primary AI failed: ${lastError}`);
}

// ── Gemini ────────────────────────────────────────────────────────────────────
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];

async function callGemini(prompt: string): Promise<string> {
  let lastError = '';
  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errArr = errBody?.error as Record<string, unknown> | undefined;
        lastError = (errArr?.message as string) || `AI service error ${res.status}`;
        continue;
      }

      const data = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response. Please try again.');
      return text;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Fallback AI failed: ${lastError}`);
}

// ── Main LLM caller — tries primary, then fallback ────────────────────────────
async function callLLM(prompt: string): Promise<string> {
  try {
    return await callGroq(prompt);
  } catch (groqErr) {
    console.warn('Primary AI failed, switching to fallback:', groqErr);
  }
  try {
    return await callGemini(prompt);
  } catch (geminiErr) {
    throw new Error(
      `Analysis failed. Please check your network connection and try again. (${geminiErr instanceof Error ? geminiErr.message : geminiErr})`
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildTreeText(tree: GitHubTreeItem[]): string {
  const lines: string[] = [];
  const filtered = tree.filter(
    (t) =>
      !t.path.includes('node_modules') &&
      !t.path.includes('.git/') &&
      !t.path.includes('dist/') &&
      !t.path.includes('.next/') &&
      !t.path.endsWith('.lock') &&
      !t.path.includes('__pycache__')
  ).slice(0, 200);
  for (const item of filtered) {
    const indent = '  '.repeat((item.path.match(/\//g) || []).length);
    lines.push(`${indent}${item.type === 'tree' ? '📁' : '📄'} ${item.path}`);
  }
  return lines.join('\n');
}

function extractJson(raw: string): string {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return s;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function analyzeRepository(
  owner: string,
  repo: string,
  repoDescription: string,
  language: string | null,
  topics: string[],
  tree: GitHubTreeItem[],
  readme: string,
  fileContext: string,
  repoUrl: string
): Promise<RepoAnalysis> {
  const treeText = buildTreeText(tree);
  const readmeSnippet = readme.slice(0, 3000);

  const prompt = `You are an expert software engineer. Analyze this GitHub repository thoroughly and return a structured JSON analysis.

Repository: ${owner}/${repo}
Description: ${repoDescription || 'No description provided'}
Primary Language: ${language || 'Unknown'}
Topics: ${topics.join(', ') || 'none'}

FILE TREE (full structure):
${treeText}

README (first 3000 chars):
${readmeSnippet}

KEY FILE CONTENTS:
${fileContext}

Return ONLY a valid JSON object with this EXACT structure:
{
  "projectName": "${repo}",
  "tagline": "One punchy sentence describing what this project is",
  "summary": "4-6 sentences: what the project is, what problem it solves, who it's for, and what makes it special",
  "purpose": "2-3 sentences explaining the core purpose and use case in simple terms",
  "howItWorks": "2-4 sentences explaining HOW the platform/tool works internally at a high level",
  "techStack": ["array", "of", "technologies", "used"],
  "techDetails": [
    {
      "name": "TechName",
      "role": "What role this technology plays in the project"
    }
  ],
  "folderStructure": [
    {
      "name": "folder or file name",
      "path": "exact/path/to/item",
      "type": "dir or file",
      "description": "clear description of what this folder/file contains or does",
      "importance": "high | medium | low",
      "children": [
        {
          "name": "child name",
          "path": "exact/path/to/child",
          "type": "dir or file",
          "description": "what this child item does",
          "importance": "high | medium | low",
          "children": []
        }
      ]
    }
  ],
  "functions": [
    {
      "name": "FunctionOrClassName",
      "type": "function | class | component | other",
      "file": "exact/path/to/file.ext",
      "description": "what this function/class does and why it matters",
      "role": "entry-point | routing | core-logic | model | controller | config | utility | other"
    }
  ],
  "howToRun": [
    "1️⃣ Clone the Repository: git clone https://github.com/${owner}/${repo}.git",
    "2️⃣ Navigate to Project Folder: cd ${repo}",
    "3️⃣ Install Dependencies: npm install",
    "4️⃣ Run the Project: npm start"
  ]
}

STRICT RULES:
- folderStructure: Include ALL top-level items. For dirs, include ALL their children (depth 1-2). Be thorough — show the complete structure. Max 40 items total.
- functions: Include 8-14 of the MOST IMPORTANT files/functions/classes. Focus on: entry points, routing, core logic, models, controllers, config.
- howToRun: Generate 5-7 beginner-friendly numbered steps with emojis. Include actual commands. Detect project type (Node/Python/Docker) from files.
- techDetails: For each tech in techStack, explain its specific role in THIS project.
- summary: Must be detailed and informative, not generic. Mention specific features.
- All text must be clear, simple English. No jargon.
- Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

  const raw = await callLLM(prompt);
  const jsonStr = extractJson(raw);

  let parsed: {
    projectName?: string;
    tagline?: string;
    summary: string;
    purpose?: string;
    howItWorks?: string;
    techStack: string[];
    techDetails?: import('../types').TechDetail[];
    folderStructure: FolderItem[];
    functions: FunctionItem[];
    howToRun: string[];
  };

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }

  return {
    repoUrl,
    repoName: repo,
    owner,
    projectName: parsed.projectName || repo,
    tagline: parsed.tagline || '',
    summary: parsed.summary || '',
    purpose: parsed.purpose || '',
    howItWorks: parsed.howItWorks || '',
    techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
    techDetails: Array.isArray(parsed.techDetails) ? parsed.techDetails : [],
    folderStructure: (Array.isArray(parsed.folderStructure) ? parsed.folderStructure : []).map(
      (item) => ({ ...item, expanded: item.type === 'dir' })
    ),
    functions: Array.isArray(parsed.functions) ? parsed.functions : [],
    howToRun: Array.isArray(parsed.howToRun) ? parsed.howToRun : [],
    analyzedAt: Date.now(),
  };
}
