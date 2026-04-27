import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TagChip } from '@rahul-dev/shared-ui';

interface CareerEntry {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly location: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly tags: readonly string[];
  readonly current?: boolean;
}

const CAREER: readonly CareerEntry[] = [
  {
    id: 'data-unveil',
    company: 'Data Unveil',
    role: 'Software Developer',
    period: 'Oct 2025 — Present',
    location: 'Hyderabad, India',
    summary:
      'Building the SCRAII analytics platform — an AI-powered text-to-SQL interface and workflow automation modules for enterprise teams.',
    highlights: [
      'Shipping the SCRAII AI module — converts natural-language prompts into SQL and renders results as tables or D3 charts.',
      'Building a Task Management & Workflow module to automate complex operational flows.',
      'Reduced load time and bundle size via lazy loading, route-level code splitting, and Signals-based rendering.',
      'Using Claude Code for AI-augmented debugging and performance work.',
    ],
    tags: ['Angular 19', 'Signals', 'TypeScript', 'D3.js', 'Chart.js', 'REST APIs', 'Claude Code'],
    current: true,
  },
  {
    id: 'finch-engineer',
    company: 'Finch Innovate',
    role: 'Engineer — Software Development',
    period: 'Nov 2024 — Oct 2025',
    location: 'Kochi, India',
    summary:
      'Senior FE on FinchCOMPLY and FinchSCAN — SaaS compliance and AML tooling for international enterprise clients.',
    highlights: [
      'Designed compliance dashboards in FinchCOMPLY, automating risk & regulatory workflows.',
      'Cut manual AML review time by 40% through real-time REST integrations and interactive visualisations on FinchSCAN.',
      'Improved client satisfaction by 20% via UX collaboration with international teams.',
      'Strengthened CI/CD pipelines with Azure DevOps and explored Docker-based deployments.',
    ],
    tags: ['Angular 15–18', 'RxJS', 'PrimeNG', 'Chart.js', 'Azure DevOps', 'Jasmine', 'Karma'],
    current: false,
  },
  {
    id: 'finch-junior',
    company: 'Finch Innovate',
    role: 'Junior Engineer — Software Development',
    period: 'Nov 2022 — Nov 2024',
    location: 'Kochi, India',
    summary:
      'Started my career shipping responsive, production-grade UIs on enterprise fintech.',
    highlights: [
      'Led the Angular 14 → 15 migration across enterprise fintech apps, preserving stability at scale.',
      'Built responsive UIs with PrimeNG and Angular Material for cross-device compatibility.',
      'Delivered visual reporting modules with Chart.js for compliance analytics.',
      'Contributed to Agile sprint planning and international delivery cycles.',
    ],
    tags: ['Angular 14–15', 'TypeScript', 'SCSS', 'PrimeNG', 'Angular Material', 'Bootstrap'],
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
