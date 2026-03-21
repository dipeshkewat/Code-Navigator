export interface RepoAnalysis {
  repoUrl: string;
  repoName: string;
  owner: string;
  // Rich summary fields
  projectName: string;
  tagline: string;
  summary: string;
  purpose: string;
  howItWorks: string;
  // Tech
  techStack: string[];
  techDetails: TechDetail[];
  // Structure
  folderStructure: FolderItem[];
  // Functions/files
  functions: FunctionItem[];
  // Run guide
  howToRun: string[];
  analyzedAt: number;
}

export interface TechDetail {
  name: string;
  role: string;
}

export interface FolderItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  description: string;
  importance?: 'high' | 'medium' | 'low';
  children?: FolderItem[];
  expanded?: boolean;
}

export interface FunctionItem {
  name: string;
  type: 'function' | 'class' | 'component' | 'other';
  file: string;
  description: string;
  role?: string;
}

export type AnalysisStatus =
  | 'idle'
  | 'fetching'
  | 'analyzing'
  | 'done'
  | 'error';
