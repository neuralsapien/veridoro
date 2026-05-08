import braveSearch from './tools/brave-search.json';
import filesystem from './tools/filesystem.json';
import github from './tools/github.json';

export interface ScoreEntry {
  value: number;
  evidence_url: string;
  scored_at: string;
  notes: string;
}

export interface Tool {
  slug: string;
  name: string;
  vendor: string;
  url: string;
  repo: string;
  description: string;
  category: string;
  scores: {
    doc_quality: ScoreEntry;
    auth_security: ScoreEntry;
    tool_coverage: ScoreEntry;
    reliability: ScoreEntry;
    community: ScoreEntry;
  };
  composite: number;
  last_reviewed_by: string;
  last_reviewed_at: string;
  needs_human_review: boolean;
}

export const CRITERIA: { key: keyof Tool['scores']; label: string; anchor: string }[] = [
  { key: 'doc_quality',    label: 'Documentation Quality',    anchor: 'doc-quality' },
  { key: 'auth_security',  label: 'Authentication & Security', anchor: 'auth-security' },
  { key: 'tool_coverage',  label: 'Tool Coverage',             anchor: 'tool-coverage' },
  { key: 'reliability',    label: 'Reliability & Error Handling', anchor: 'reliability' },
  { key: 'community',      label: 'Community & Maintenance',   anchor: 'community' },
];

export const tools: Tool[] = [braveSearch, filesystem, github] as Tool[];

export const getRankedTools = () =>
  [...tools].sort((a, b) => b.composite - a.composite);

export const getToolBySlug = (slug: string) =>
  tools.find((t) => t.slug === slug);

export const scoreColor = (v: number) =>
  v >= 8 ? 'score-high' : v >= 6 ? 'score-mid' : 'score-low';
