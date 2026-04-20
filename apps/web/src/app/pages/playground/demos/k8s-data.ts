export type K8sKind = 'deployment' | 'service' | 'pod' | 'configmap';
export type K8sStatus = 'running' | 'pending' | 'failed';

export interface K8sNode {
  readonly id: string;
  readonly label: string;
  readonly kind: K8sKind;
  readonly status: K8sStatus;
  readonly namespace: string;
}

export interface K8sEdge {
  readonly source: string;
  readonly target: string;
}

export const K8S_NODES: readonly K8sNode[] = [
  { id: 'api-dep', label: 'api', kind: 'deployment', status: 'running', namespace: 'default' },
  { id: 'api-svc', label: 'api', kind: 'service', status: 'running', namespace: 'default' },
  { id: 'api-cm', label: 'api-env', kind: 'configmap', status: 'running', namespace: 'default' },
  { id: 'api-p1', label: 'api-6c2', kind: 'pod', status: 'running', namespace: 'default' },
  { id: 'api-p2', label: 'api-b8f', kind: 'pod', status: 'running', namespace: 'default' },
  { id: 'api-p3', label: 'api-3a1', kind: 'pod', status: 'pending', namespace: 'default' },

  { id: 'web-dep', label: 'web', kind: 'deployment', status: 'running', namespace: 'default' },
  { id: 'web-svc', label: 'web', kind: 'service', status: 'running', namespace: 'default' },
  { id: 'web-p1', label: 'web-7d9', kind: 'pod', status: 'running', namespace: 'default' },
  { id: 'web-p2', label: 'web-e42', kind: 'pod', status: 'failed', namespace: 'default' },

  { id: 'pg-svc', label: 'postgres', kind: 'service', status: 'running', namespace: 'data' },
  { id: 'pg-pod', label: 'postgres-0', kind: 'pod', status: 'running', namespace: 'data' },
  { id: 'pg-cm', label: 'pg-config', kind: 'configmap', status: 'running', namespace: 'data' },

  { id: 'redis-svc', label: 'redis', kind: 'service', status: 'running', namespace: 'data' },
  { id: 'redis-pod', label: 'redis-0', kind: 'pod', status: 'running', namespace: 'data' },
];

export const K8S_EDGES: readonly K8sEdge[] = [
  { source: 'api-dep', target: 'api-p1' },
  { source: 'api-dep', target: 'api-p2' },
  { source: 'api-dep', target: 'api-p3' },
  { source: 'api-svc', target: 'api-p1' },
  { source: 'api-svc', target: 'api-p2' },
  { source: 'api-cm', target: 'api-p1' },
  { source: 'api-cm', target: 'api-p2' },

  { source: 'web-dep', target: 'web-p1' },
  { source: 'web-dep', target: 'web-p2' },
  { source: 'web-svc', target: 'web-p1' },
  { source: 'web-svc', target: 'web-p2' },

  { source: 'pg-svc', target: 'pg-pod' },
  { source: 'pg-cm', target: 'pg-pod' },
  { source: 'redis-svc', target: 'redis-pod' },

  // App → data plane calls.
  { source: 'api-p1', target: 'pg-svc' },
  { source: 'api-p2', target: 'pg-svc' },
  { source: 'api-p1', target: 'redis-svc' },
  { source: 'web-p1', target: 'api-svc' },
  { source: 'web-p2', target: 'api-svc' },
];

export const K8S_KIND_COLOR: Record<K8sKind, string> = {
  deployment: 'var(--accent-secondary)',
  service: 'var(--accent-primary)',
  pod: 'var(--cat-data)',
  configmap: 'var(--cat-infra)',
};

export const K8S_STATUS_COLOR: Record<K8sStatus, string> = {
  running: 'var(--success)',
  pending: 'var(--accent-secondary)',
  failed: 'var(--error)',
};
