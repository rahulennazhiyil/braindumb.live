import { describe, expect, it } from 'vitest';
import { PIPELINE_LINKS, PIPELINE_NODES } from './cicd-data';

describe('CI/CD pipeline dataset', () => {
  it('all links reference known node ids', () => {
    const ids = new Set(PIPELINE_NODES.map((n) => n.id));
    for (const l of PIPELINE_LINKS) {
      expect(ids.has(l.source), `source ${l.source}`).toBe(true);
      expect(ids.has(l.target), `target ${l.target}`).toBe(true);
    }
  });

  it('every link has a positive duration', () => {
    for (const l of PIPELINE_LINKS) {
      expect(l.seconds).toBeGreaterThan(0);
    }
  });
});
