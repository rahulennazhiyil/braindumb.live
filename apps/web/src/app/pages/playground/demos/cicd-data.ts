export interface PipelineNode {
  readonly id: string;
  readonly label: string;
  readonly stage: 'source' | 'build' | 'test' | 'deploy' | 'gate';
}

export interface PipelineLink {
  readonly source: string;
  readonly target: string;
  /** Duration in seconds; maps to stroke width. */
  readonly seconds: number;
}

export const PIPELINE_NODES: readonly PipelineNode[] = [
  { id: 'commit', label: 'commit', stage: 'source' },

  { id: 'install', label: 'npm ci', stage: 'build' },
  { id: 'typecheck', label: 'typecheck', stage: 'build' },
  { id: 'build', label: 'nx build', stage: 'build' },

  { id: 'lint', label: 'lint', stage: 'test' },
  { id: 'unit', label: 'unit', stage: 'test' },
  { id: 'e2e', label: 'playwright', stage: 'test' },

  { id: 'gate', label: 'approval', stage: 'gate' },
  { id: 'preview', label: 'preview', stage: 'deploy' },
  { id: 'prod', label: 'prod', stage: 'deploy' },
];

export const PIPELINE_LINKS: readonly PipelineLink[] = [
  { source: 'commit', target: 'install', seconds: 18 },
  { source: 'install', target: 'typecheck', seconds: 24 },
  { source: 'install', target: 'lint', seconds: 14 },
  { source: 'typecheck', target: 'build', seconds: 46 },
  { source: 'typecheck', target: 'unit', seconds: 32 },
  { source: 'build', target: 'e2e', seconds: 74 },
  { source: 'unit', target: 'gate', seconds: 6 },
  { source: 'lint', target: 'gate', seconds: 4 },
  { source: 'e2e', target: 'gate', seconds: 12 },
  { source: 'gate', target: 'preview', seconds: 22 },
  { source: 'preview', target: 'prod', seconds: 28 },
];

export const STAGE_COLOR: Record<PipelineNode['stage'], string> = {
  source: 'var(--text-muted)',
  build: 'var(--accent-primary)',
  test: 'var(--accent-secondary)',
  gate: 'var(--cat-platform)',
  deploy: 'var(--success)',
};
