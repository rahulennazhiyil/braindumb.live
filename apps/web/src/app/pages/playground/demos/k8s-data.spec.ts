import { describe, expect, it } from 'vitest';
import { K8S_EDGES, K8S_NODES } from './k8s-data';

describe('K8s dataset', () => {
  it('all edges reference known node ids', () => {
    const ids = new Set(K8S_NODES.map((n) => n.id));
    for (const e of K8S_EDGES) {
      expect(ids.has(e.source), `edge source ${e.source}`).toBe(true);
      expect(ids.has(e.target), `edge target ${e.target}`).toBe(true);
    }
  });

  it('node ids are unique', () => {
    const ids = K8S_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
