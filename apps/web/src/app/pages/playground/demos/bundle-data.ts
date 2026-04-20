export type LoadStrategy = 'eager' | 'lazy';

export interface BundleLeaf {
  readonly name: string;
  readonly kb: number;
  readonly strategy: LoadStrategy;
}

export interface BundleBranch {
  readonly name: string;
  readonly children: readonly (BundleBranch | BundleLeaf)[];
}

export type BundleNode = BundleBranch | BundleLeaf;

export function isLeaf(node: BundleNode): node is BundleLeaf {
  return (node as BundleLeaf).kb !== undefined;
}

/**
 * Snapshot-like bundle breakdown roughly matching the project's current
 * dist output. Numbers are illustrative — swap for real values via a
 * webpack-bundle-analyzer export later.
 */
export const BUNDLE_TREE: BundleBranch = {
  name: 'rahul-dev',
  children: [
    {
      name: 'framework',
      children: [
        { name: '@angular/core', kb: 92, strategy: 'eager' },
        { name: '@angular/common', kb: 38, strategy: 'eager' },
        { name: '@angular/router', kb: 46, strategy: 'eager' },
        { name: '@angular/platform-browser', kb: 28, strategy: 'eager' },
      ],
    },
    {
      name: 'visualization',
      children: [
        { name: 'd3-force', kb: 22, strategy: 'eager' },
        { name: 'd3-selection', kb: 14, strategy: 'eager' },
        { name: 'd3-sankey', kb: 18, strategy: 'lazy' },
        { name: 'd3-hierarchy', kb: 16, strategy: 'lazy' },
      ],
    },
    {
      name: 'ui',
      children: [
        { name: 'shared/ui', kb: 24, strategy: 'eager' },
        { name: 'shared/terminal', kb: 9, strategy: 'eager' },
        { name: 'shared/theme', kb: 6, strategy: 'eager' },
        { name: 'lucide-angular', kb: 14, strategy: 'eager' },
      ],
    },
    {
      name: 'features',
      children: [
        { name: 'hero-graph', kb: 26, strategy: 'eager' },
        { name: 'd3-playground', kb: 48, strategy: 'lazy' },
        { name: 'admin', kb: 62, strategy: 'lazy' },
        { name: 'visitor-insights', kb: 38, strategy: 'lazy' },
        { name: 'finance-analyzer', kb: 72, strategy: 'lazy' },
      ],
    },
    {
      name: 'data',
      children: [
        { name: '@supabase/supabase-js', kb: 54, strategy: 'eager' },
        { name: 'core/supabase', kb: 6, strategy: 'eager' },
        { name: 'core/auth', kb: 4, strategy: 'eager' },
      ],
    },
    {
      name: 'fonts',
      children: [
        { name: 'inter-variable', kb: 24, strategy: 'eager' },
        { name: 'jetbrains-mono-variable', kb: 22, strategy: 'eager' },
      ],
    },
  ],
};

export const STRATEGY_COLOR: Record<LoadStrategy, string> = {
  eager: 'var(--accent-primary)',
  lazy: 'var(--accent-secondary)',
};
