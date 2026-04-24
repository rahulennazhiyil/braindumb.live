import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import { TerminalService } from '@rahul-dev/shared-terminal';
import { Button, CountUp, Reveal, SectionHeading, TagChip } from '@rahul-dev/shared-ui';
import { Github, Linkedin, LucideAngularModule, Mail, MapPin } from 'lucide-angular';

interface Metric {
  readonly value: string;
  readonly label: string;
  readonly detail?: string;
  /** If present, triggers the count-up directive with this target. */
  readonly countTo?: number;
  /** Text rendered after the animated number. Defaults to empty. */
  readonly countSuffix?: string;
  /** Text rendered before the animated number (e.g. a '+' or a unit). */
  readonly countTrail?: string;
}

interface FeaturedProject {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly tech: readonly string[];
  readonly role: string;
  readonly status: string;
}

interface HomeCard {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

@Component({
  selector: 'app-home',
  imports: [
    Button,
    CountUp,
    Reveal,
    SectionHeading,
    TagChip,
    RouterLink,
    HeroGraph,
    LucideAngularModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly terminal = inject(TerminalService);

  protected readonly Github = Github;
  protected readonly Linkedin = Linkedin;
  protected readonly Mail = Mail;
  protected readonly MapPin = MapPin;

  protected readonly contact = {
    email: 'rahulennazhiyil6@gmail.com',
    github: 'https://github.com/rahulennazhiyil',
    linkedin: 'https://linkedin.com/in/rahul-ennazhiyil',
    location: 'Bengaluru, IN',
  };

  protected readonly heroStack: readonly string[] = [
    'Angular 14–19',
    'TypeScript',
    'RxJS',
    'Signals',
    'D3.js',
    'Chart.js',
    'SCSS',
    'Azure DevOps',
  ];

  protected readonly metrics: readonly Metric[] = [
    {
      value: '3+ yrs',
      label: 'shipping production Angular',
      detail: 'v14 through v19 · Signals · RxJS',
      countTo: 3,
      countSuffix: '+',
      countTrail: ' yrs',
    },
    {
      value: '40%',
      label: 'manual AML review time cut',
      detail: 'via real-time API integrations on FinchSCAN',
      countTo: 40,
      countSuffix: '%',
    },
    {
      value: '20%',
      label: 'client satisfaction lift',
      detail: 'UX collaboration with international teams',
      countTo: 20,
      countSuffix: '%',
    },
    {
      value: 'AI · SQL',
      label: 'text-to-SQL interface in flight',
      detail: 'SCRAII analytics at Data Unveil',
    },
  ];

  protected readonly featured: readonly FeaturedProject[] = [
    {
      slug: 'scraii',
      name: 'SCRAII',
      tagline: 'Text → SQL → chart. In one breath.',
      description:
        'AI-powered analytics platform at Data Unveil. Natural-language prompts become SQL queries and render as tables or live D3 / Chart.js visuals. Also home to the task-management & workflow module.',
      tech: ['Angular 19', 'Signals', 'TypeScript', 'D3.js', 'Chart.js', 'REST APIs'],
      role: 'Frontend · Oct 2025 – Present',
      status: 'Shipping',
    },
    {
      slug: 'finchscan',
      name: 'FinchSCAN',
      tagline: 'AML name-screening at enterprise scale.',
      description:
        'SaaS AML portal for screening high-risk individuals and entities. Built the screening + goAML reporting front-end and cut manual review time by 40% with real-time REST integrations and Chart.js visualisations.',
      tech: ['Angular 14–15', 'RxJS', 'Angular Material', 'Chart.js', 'Azure DevOps'],
      role: 'Frontend Engineer · Finch Innovate',
      status: 'Shipped',
    },
    {
      slug: 'finchcomply',
      name: 'FinchCOMPLY',
      tagline: 'Compliance workflows, automated.',
      description:
        'Compliance automation platform for enterprise regulatory workflows. Built risk-assessment and compliance-reporting UIs with PrimeNG and Bootstrap, wired real-time REST pipelines for status tracking.',
      tech: ['Angular 15–18', 'SCSS', 'PrimeNG', 'Bootstrap', 'Azure DevOps'],
      role: 'Frontend Engineer · Finch Innovate',
      status: 'Shipped',
    },
  ];

  protected readonly cards: readonly HomeCard[] = [
    {
      kicker: '01 · work',
      title: 'Projects',
      description:
        'Case studies from shipped work — SCRAII, FinchSCAN, FinchCOMPLY, and the D3 / Angular experiments behind them.',
      href: '/projects',
    },
    {
      kicker: '02 · play',
      title: 'Playground',
      description:
        'Interactive D3 demos — Kubernetes force graphs, CI/CD Sankeys, bundle treemaps, finance analyzer.',
      href: '/playground',
    },
    {
      kicker: '03 · write',
      title: 'Feed',
      description:
        'Notes, posts, and links — whatever I am learning or breaking this week.',
      href: '/feed',
    },
    {
      kicker: '04 · me',
      title: 'About',
      description:
        'Career timeline, tech bubbles, and how I ended up at the intersection of Angular and data viz.',
      href: '/about',
    },
  ];

  protected onSecretTriggered(): void {
    this.terminal.open();
  }

  protected onNodeActivated(node: TechNode): void {
    void node;
  }
}
