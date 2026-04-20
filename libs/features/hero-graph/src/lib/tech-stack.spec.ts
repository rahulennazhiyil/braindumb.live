import { describe, expect, it } from 'vitest';
import { TECH_STACK, buildAdjacency } from './tech-stack';

describe('TECH_STACK dataset', () => {
  it('has exactly one secret node', () => {
    const secret = TECH_STACK.nodes.filter((n) => n.secret);
    expect(secret).toHaveLength(1);
  });

  it('every edge references an existing node id', () => {
    const ids = new Set(TECH_STACK.nodes.map((n) => n.id));
    for (const e of TECH_STACK.edges) {
      expect(ids.has(e.source), `edge source ${e.source}`).toBe(true);
      expect(ids.has(e.target), `edge target ${e.target}`).toBe(true);
    }
  });

  it('node ids are unique', () => {
    const ids = TECH_STACK.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('buildAdjacency', () => {
  it('returns neighbors in both directions', () => {
    const adj = buildAdjacency([
      { source: 'a', target: 'b', strength: 1 },
      { source: 'b', target: 'c', strength: 2 },
    ]);
    expect([...(adj.get('a') ?? [])]).toEqual(['b']);
    expect([...(adj.get('b') ?? [])].sort()).toEqual(['a', 'c']);
    expect([...(adj.get('c') ?? [])]).toEqual(['b']);
  });

  it('handles empty edges', () => {
    const adj = buildAdjacency([]);
    expect(adj.size).toBe(0);
  });
});
