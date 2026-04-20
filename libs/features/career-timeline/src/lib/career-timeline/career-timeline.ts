import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TagChip } from '@rahul-dev/shared-ui';

interface CareerEntry {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly tags: readonly string[];
  readonly current?: boolean;
}

// Edit this array with your actual career history.
const CAREER: readonly CareerEntry[] = [
  {
    id: 'data-unveil',
    company: 'Data Unveil',
    role: 'Frontend Developer',
    period: '2022 — Present',
    summary:
      'Building data-heavy web applications and interactive dashboards for enterprise clients using Angular and D3.',
    highlights: [
      'Architected a reusable Angular component library adopted across 3 product lines',
      'Built real-time D3 dashboards visualising 10k+ data points with <16ms frame budgets',
      'Led team migration from AngularJS to Angular 15+, reducing bundle size by 40%',
    ],
    tags: ['Angular', 'TypeScript', 'D3', 'RxJS', 'Tailwind'],
    current: true,
  },
  {
    id: 'prev-1',
    company: 'Previous Company',
    role: 'Junior Frontend Developer',
    period: '2020 — 2022',
    summary:
      'Developed client-facing web applications and internal tooling in an Angular + Node.js stack.',
    highlights: [
      'Shipped 5+ features end-to-end across the full Angular/Node.js stack',
      'Improved CI pipeline run time by 30% through parallelisation and caching',
    ],
    tags: ['Angular', 'TypeScript', 'SCSS', 'Jest'],
    current: false,
  },
];

@Component({
  selector: 'app-career-timeline',
  imports: [TagChip],
  templateUrl: './career-timeline.html',
  styleUrl: './career-timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerTimeline {
  protected readonly entries = CAREER;
}
