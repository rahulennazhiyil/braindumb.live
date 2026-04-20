import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  inject,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';

type SkillCategory = 'frontend' | 'viz' | 'backend' | 'infra' | 'tools';

interface TechSkill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategory;
  /** 1 = familiar · 2 = proficient · 3 = expert */
  readonly level: 1 | 2 | 3;
}

// Edit this array with your actual tech stack.
const SKILLS: readonly TechSkill[] = [
  { id: 'angular', name: 'Angular', category: 'frontend', level: 3 },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 3 },
  { id: 'html-css', name: 'HTML / CSS', category: 'frontend', level: 3 },
  { id: 'rxjs', name: 'RxJS', category: 'frontend', level: 2 },
  { id: 'tailwind', name: 'Tailwind', category: 'frontend', level: 2 },
  { id: 'd3', name: 'D3.js', category: 'viz', level: 2 },
  { id: 'svg', name: 'SVG', category: 'viz', level: 2 },
  { id: 'canvas', name: 'Canvas', category: 'viz', level: 1 },
  { id: 'supabase', name: 'Supabase', category: 'backend', level: 2 },
  { id: 'postgresql', name: 'PostgreSQL', category: 'backend', level: 1 },
  { id: 'nodejs', name: 'Node.js', category: 'backend', level: 1 },
  { id: 'nx', name: 'Nx', category: 'infra', level: 2 },
  { id: 'vercel', name: 'Vercel', category: 'infra', level: 2 },
  { id: 'git', name: 'Git', category: 'infra', level: 3 },
  { id: 'vitest', name: 'Vitest', category: 'tools', level: 2 },
  { id: 'playwright', name: 'Playwright', category: 'tools', level: 1 },
  { id: 'figma', name: 'Figma', category: 'tools', level: 1 },
];

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  viz: 'Visualisation',
  backend: 'Backend',
  infra: 'Infra',
  tools: 'Tools',
};

const RADIUS: Record<1 | 2 | 3, number> = { 1: 28, 2: 38, 3: 50 };

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: SkillCategory;
  r: number;
}

@Component({
  selector: 'app-tech-bubbles',
  templateUrl: './tech-bubbles.html',
  styleUrl: './tech-bubbles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechBubbles implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  protected readonly categories = Object.entries(CATEGORY_LABELS).map(
    ([id, label]) => ({ id: id as SkillCategory, label }),
  );

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.initChart());
  }

  private initChart(): void {
    const svgEl = this.svgRef()?.nativeElement;
    if (!svgEl) return;

    const nodes: SimNode[] = SKILLS.map((s) => ({
      ...s,
      r: RADIUS[s.level],
    }));

    const draw = () => {
      const W = svgEl.clientWidth || 600;
      const H = 420;
      svgEl.setAttribute('height', String(H));

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const sim = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-40))
        .force('collide', d3.forceCollide<SimNode>().radius((d) => d.r + 5).strength(0.9))
        .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
        .alphaDecay(0.025);

      const g = svg.append('g');

      const bubble = g
        .selectAll<SVGGElement, SimNode>('g.bubble')
        .data(nodes)
        .join('g')
        .attr('class', 'bubble')
        .attr('role', 'img')
        .attr('aria-label', (d) => `${d.name} — ${CATEGORY_LABELS[d.category]}`);

      bubble
        .append('circle')
        .attr('r', (d) => d.r)
        .attr('class', (d) => `bubble__circle bubble__circle--${d.category}`);

      bubble
        .append('text')
        .attr('class', 'bubble__label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text((d) => d.name);

      sim.on('tick', () => {
        bubble.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });

      const ro = new ResizeObserver(() => {
        sim.stop();
        draw();
      });
      if (svgEl.parentElement) ro.observe(svgEl.parentElement);

      this.destroyRef.onDestroy(() => {
        sim.stop();
        ro.disconnect();
      });
    };

    draw();
  }
}
