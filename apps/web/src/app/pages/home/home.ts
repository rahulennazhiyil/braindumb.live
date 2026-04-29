import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import { TerminalService } from '@rahul-dev/shared-terminal';
import { Button, Reveal, SectionHeading, TagChip } from '@rahul-dev/shared-ui';
import { Github, Linkedin, LucideAngularModule, Mail, MapPin } from 'lucide-angular';

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

  protected readonly featuredCard: HomeCard = {
    kicker: 'play',
    title: 'Playground',
    description:
      'Live D3 demos: Kubernetes force graph, CI/CD Sankey, bundle treemap, fully-client-side finance analyzer. The visualization work, running.',
    href: '/playground',
  };

  protected readonly secondaryCards: readonly HomeCard[] = [
    {
      kicker: 'me',
      title: 'About',
      description:
        'Career timeline, tech bubbles, and the path from Angular to data viz.',
      href: '/about',
    },
    {
      kicker: 'write',
      title: 'Feed',
      description:
        'Notes, posts, and links from what I am learning or breaking this week.',
      href: '/feed',
    },
  ];

  protected onSecretTriggered(): void {
    this.terminal.open();
  }

  protected onNodeActivated(node: TechNode): void {
    void node;
  }
}
