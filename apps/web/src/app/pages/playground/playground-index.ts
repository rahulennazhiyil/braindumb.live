import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { Reveal, TagChip } from '@rahul-dev/shared-ui';
import { ArrowUpRight, LucideAngularModule } from 'lucide-angular';

interface DemoCard {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly status: 'live' | 'soon';
}

@Component({
  selector: 'app-playground-index',
  imports: [
    RouterLink,
    LucideAngularModule,
    Reveal,
    TagChip,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './playground-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundIndex {
  protected readonly ArrowUpRight = ArrowUpRight;

  protected readonly playgroundReady = signal<boolean>(false);

  protected readonly demos: readonly DemoCard[] = [
    {
      slug: 'kubernetes',
      title: 'Kubernetes cluster',
      description:
        'Force-directed graph of pods, services, deployments, and config maps with status colors.',
      tags: ['force layout', 'D3.js', 'Kubernetes'],
      status: 'live',
    },
    {
      slug: 'cicd',
      title: 'CI/CD pipeline',
      description:
        'Sankey of an Nx build pipeline. Flow width encodes wall-clock seconds per stage.',
      tags: ['sankey', 'd3-sankey', 'CI/CD'],
      status: 'live',
    },
    {
      slug: 'bundle',
      title: 'Bundle treemap',
      description:
        'Squarify layout of the app bundle. Sized by KB, colored by lazy vs eager load strategy.',
      tags: ['treemap', 'd3-hierarchy', 'bundling'],
      status: 'live',
    },
    {
      slug: 'force-pop',
      title: 'Force Pop · mini-game',
      description:
        'Tap rising bubbles before they drift off the top. Combos chain, smaller is worth more, 30 seconds.',
      tags: ['game', 'rAF', 'mobile-first'],
      status: 'live',
    },
    {
      slug: 'rxjs',
      title: 'RxJS marble stream',
      description:
        'Animated marble diagram over observable operators. Play, pause, change speed.',
      tags: ['RxJS', 'animation'],
      status: 'soon',
    },
    {
      slug: 'heatmap',
      title: 'API latency heatmap',
      description:
        'Calendar heatmap of daily p95 latency. Zoom from week to day.',
      tags: ['heatmap', 'observability'],
      status: 'soon',
    },
    {
      slug: 'docker',
      title: 'Docker network',
      description:
        'Chord diagram of container-to-container communication.',
      tags: ['chord', 'Docker'],
      status: 'soon',
    },
    {
      slug: 'realtime',
      title: 'Realtime dashboard',
      description:
        'Line, bar, and gauge charts driven by an RxJS interval.',
      tags: ['multi-chart', 'RxJS', 'realtime'],
      status: 'soon',
    },
  ];

  protected onPlaygroundEnter(): void {
    this.playgroundReady.set(true);
  }
}
