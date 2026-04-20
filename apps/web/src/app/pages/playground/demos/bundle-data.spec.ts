import { describe, expect, it } from 'vitest';
import { BUNDLE_TREE, isLeaf } from './bundle-data';

function totalKb(node: typeof BUNDLE_TREE): number {
  return node.children.reduce(
    (sum, child) =>
      sum + (isLeaf(child) ? child.kb : totalKb(child)),
    0,
  );
}

describe('Bundle tree', () => {
  it('every leaf has positive kb', () => {
    const walk = (n: typeof BUNDLE_TREE): void => {
      for (const c of n.children) {
        if (isLeaf(c)) expect(c.kb).toBeGreaterThan(0);
        else walk(c);
      }
    };
    walk(BUNDLE_TREE);
  });

  it('total bundle size is non-zero', () => {
    expect(totalKb(BUNDLE_TREE)).toBeGreaterThan(0);
  });
});
