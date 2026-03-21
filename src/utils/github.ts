export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\.git$/, '');
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/?#\s]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getGitHubHeaders(),
  });
  if (!res.ok) throw new Error(`Repository not found or is private (${res.status})`);
  return res.json();
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubTreeItem[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: getGitHubHeaders() }
  );
  if (!res.ok) throw new Error(`Failed to fetch repository tree (${res.status})`);
  const data = await res.json();
  return data.tree || [];
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers: getGitHubHeaders() }
  );
  if (!res.ok) return '';
  const data = await res.json();
  if (data.encoding === 'base64' && data.content) {
    return atob(data.content.replace(/\n/g, ''));
  }
  return '';
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: getGitHubHeaders() }
    );
    if (!res.ok) return '';
    const data = await res.json();
    if (data.encoding === 'base64' && data.content) {
      return atob(data.content.replace(/\n/g, ''));
    }
    return '';
  } catch {
    return '';
  }
}

/** Gather key files content to feed to the AI */
export async function gatherRepoContext(
  owner: string,
  repo: string,
  tree: GitHubTreeItem[]
): Promise<string> {
  const importantFiles = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'setup.py',
    'go.mod',
    'Cargo.toml',
    'pom.xml',
    'build.gradle',
    'Makefile',
    'docker-compose.yml',
    'Dockerfile',
    '.env.example',
  ];

  const filesToFetch: string[] = [];

  // Add important config files that exist
  for (const f of importantFiles) {
    if (tree.some((t) => t.path === f || t.path.endsWith('/' + f))) {
      const found = tree.find((t) => t.path === f || t.path.endsWith('/' + f));
      if (found) filesToFetch.push(found.path);
    }
  }

  // Priority: entry points first, then routing, then core logic
  const priorityPatterns = [
    /^(app|main|index|server)\.(ts|tsx|js|jsx|py|go|rs|java)$/i,
    /\/(app|main|index|server)\.(ts|tsx|js|jsx|py|go|rs|java)$/i,
    /(routes?|router|controller|model|service|api)\.(ts|tsx|js|jsx|py|go)$/i,
  ];

  const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.rb', '.php'];
  const allSourceFiles = tree.filter(
    (t) =>
      t.type === 'blob' &&
      sourceExtensions.some((ext) => t.path.endsWith(ext)) &&
      !t.path.includes('node_modules') &&
      !t.path.includes('.min.') &&
      !t.path.includes('dist/') &&
      !t.path.includes('build/') &&
      !t.path.includes('.test.') &&
      !t.path.includes('.spec.') &&
      (t.size ?? 0) < 40000
  );

  // Sort by priority patterns first
  const prioritized = allSourceFiles.filter(f =>
    priorityPatterns.some(p => p.test(f.path))
  );
  const rest = allSourceFiles.filter(f =>
    !priorityPatterns.some(p => p.test(f.path))
  );
  const sourceFiles = [...prioritized, ...rest].slice(0, 8);

  for (const sf of sourceFiles) {
    if (!filesToFetch.includes(sf.path)) filesToFetch.push(sf.path);
  }

  // Fetch in parallel (limit to 12 files)
  const results = await Promise.allSettled(
    filesToFetch.slice(0, 12).map(async (path) => {
      const content = await fetchFileContent(owner, repo, path);
      return `\n\n=== FILE: ${path} ===\n${content.slice(0, 4000)}`;
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<string>).value)
    .join('');
}
