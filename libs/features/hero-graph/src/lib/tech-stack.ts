export type TechCategory =
  | 'framework'
  | 'language'
  | 'viz'
  | 'infra'
  | 'data'
  | 'platform'
  | 'tool';

export interface TechNode {
  readonly id: string;
  readonly label: string;
  readonly category: TechCategory;
  /** 1 = just-learning, 5 = expert. Drives radius + glow intensity. */
  readonly level: 1 | 2 | 3 | 4 | 5;
  /** When true, hides the node under a subtle visual cue; triple-click fires
   *  the `secretTriggered` output. Exactly one node should carry this flag. */
  readonly secret?: boolean;
  /** Optional deep-link target used by downstream consumers on click. */
  readonly href?: string;
}

export interface TechEdge {
  readonly source: string;
  readonly target: string;
  /** 1–3; maps to stroke opacity / thickness. */
  readonly strength: 1 | 2 | 3;
}

export interface TechStackData {
  readonly nodes: readonly TechNode[];
  readonly edges: readonly TechEdge[];
}

/**
 * Default dataset seeded from Rahul's resume (Phase 7). Keep small enough
 * that the force simulation stays readable — add more via admin later.
 */
export const TECH_STACK: TechStackData = {
  nodes: [
    { id: 'angular', label: 'Angular', category: 'framework', level: 5 },
    { id: 'typescript', label: 'TypeScript', category: 'language', level: 5 },
    { id: 'rxjs', label: 'RxJS', category: 'framework', level: 5 },
    { id: 'signals', label: 'Signals', category: 'framework', level: 4 },
    { id: 'd3', label: 'D3.js', category: 'viz', level: 4, href: '/playground' },
    { id: 'chartjs', label: 'Chart.js', category: 'viz', level: 3 },
    { id: 'nx', label: 'Nx', category: 'tool', level: 4 },
    { id: 'tailwind', label: 'Tailwind', category: 'tool', level: 4 },
    { id: 'vitest', label: 'Vitest', category: 'tool', level: 3 },
    { id: 'supabase', label: 'Supabase', category: 'data', level: 3 },
    { id: 'postgres', label: 'PostgreSQL', category: 'data', level: 3 },
    { id: 'docker', label: 'Docker', category: 'infra', level: 3 },
    { id: 'kubernetes', label: 'Kubernetes', category: 'infra', level: 2 },
    { id: 'vercel', label: 'Vercel', category: 'platform', level: 3 },
    { id: 'anthropic', label: 'Anthropic', category: 'platform', level: 3 },
    // Secret node — deliberately subtle label ("~$ sudo").
    { id: 'sudo', label: '~$ sudo', category: 'tool', level: 1, secret: true },
  ],
  edges: [
    { source: 'angular', target: 'typescript', strength: 3 },
    { source: 'angular', target: 'rxjs', strength: 3 },
    { source: 'angular', target: 'signals', strength: 3 },
    { source: 'angular', target: 'nx', strength: 3 },
    { source: 'angular', target: 'tailwind', strength: 2 },
    { source: 'typescript', target: 'nx', strength: 2 },
    { source: 'typescript', target: 'd3', strength: 2 },
    { source: 'typescript', target: 'vitest', strength: 2 },
    { source: 'rxjs', target: 'signals', strength: 2 },
    { source: 'd3', target: 'chartjs', strength: 1 },
    { source: 'nx', target: 'vitest', strength: 2 },
    { source: 'supabase', target: 'postgres', strength: 3 },
    { source: 'supabase', target: 'angular', strength: 2 },
    { source: 'docker', target: 'kubernetes', strength: 3 },
    { source: 'docker', target: 'vercel', strength: 1 },
    { source: 'angular', target: 'vercel', strength: 2 },
    { source: 'anthropic', target: 'typescript', strength: 1 },
    { source: 'sudo', target: 'angular', strength: 1 },
  ],
};

/** Reverse-lookup for hover highlighting. */
export function buildAdjacency(
  edges: readonly TechEdge[],
): ReadonlyMap<string, ReadonlySet<string>> {
  const map = new Map<string, Set<string>>();
  const bucket = (id: string): Set<string> => {
    let set = map.get(id);
    if (!set) {
      set = new Set();
      map.set(id, set);
    }
    return set;
  };
  for (const e of edges) {
    bucket(e.source).add(e.target);
    bucket(e.target).add(e.source);
  }
  return map;
}
