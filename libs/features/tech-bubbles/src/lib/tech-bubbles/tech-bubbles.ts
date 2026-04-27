import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';

type SkillCategory = 'frontend' | 'viz' | 'styling' | 'devops' | 'practice';

interface TechSkill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategory;
  /** 1 = familiar · 2 = proficient · 3 = expert */
  readonly level: 1 | 2 | 3;
  readonly note?: string;
}

const SKILLS: readonly TechSkill[] = [
  { id: 'angular', name: 'Angular', category: 'frontend', level: 3, note: 'v14 → v19, signals, zoneless-ready' },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 3, note: 'Strict mode, generics, conditional types' },
  { id: 'javascript', name: 'JavaScript', category: 'frontend', level: 3, note: 'ES6+, async/await, closures' },
  { id: 'rxjs', name: 'RxJS', category: 'frontend', level: 3, note: 'Multicast, operators, marble tests' },
  { id: 'signals', name: 'Signals', category: 'frontend', level: 2, note: 'Computed, effects, interop with RxJS' },
  { id: 'lazy-loading', name: 'Lazy Loading', category: 'frontend', level: 2, note: 'Route-level splitting, preload strategies' },
  { id: 'rest', name: 'REST APIs', category: 'frontend', level: 3, note: 'HttpClient, interceptors, error retry' },

  { id: 'html5', name: 'HTML5', category: 'styling', level: 3, note: 'Semantic, ARIA, a11y-first' },
  { id: 'scss', name: 'SCSS', category: 'styling', level: 3, note: 'BEM, mixins, variables at scale' },
  { id: 'tailwind', name: 'Tailwind', category: 'styling', level: 2, note: 'JIT, arbitrary variants, tokens' },
  { id: 'primeng', name: 'PrimeNG', category: 'styling', level: 2, note: 'Theming, table virtualization' },
  { id: 'ng-material', name: 'Angular Material', category: 'styling', level: 2, note: 'CDK, overlay, responsive layout' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'styling', level: 2, note: 'Utility overrides + custom theming' },

  { id: 'd3', name: 'D3.js', category: 'viz', level: 2, note: 'Force graphs, Sankey, scales, selections' },
  { id: 'chartjs', name: 'Chart.js', category: 'viz', level: 3, note: 'Line/bar/donut, plugins, responsive' },
  { id: 'svg', name: 'SVG', category: 'viz', level: 2, note: 'Paths, filters, view-box math' },

  { id: 'git', name: 'Git', category: 'devops', level: 3, note: 'Rebase, bisect, worktrees' },
  { id: 'azure-devops', name: 'Azure DevOps', category: 'devops', level: 2, note: 'Pipelines, release gates, artifacts' },
  { id: 'docker', name: 'Docker', category: 'devops', level: 2, note: 'Multi-stage builds, compose' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops', level: 1, note: 'Basics — pods, services, deployments' },
  { id: 'ci-cd', name: 'CI/CD', category: 'devops', level: 2, note: 'Azure + GitHub Actions workflows' },

  { id: 'agile', name: 'Agile', category: 'practice', level: 3, note: 'Scrum, international delivery cycles' },
  { id: 'claude-code', name: 'Claude Code', category: 'practice', level: 2, note: 'Agentic workflows for perf + refactors' },
  { id: 'perf', name: 'Perf Tuning', category: 'practice', level: 2, note: 'Bundle analysis, change detection audits' },
  { id: 'a11y', name: 'A11y', category: 'practice', level: 2, note: 'WCAG 2.1 AA, screen-reader testing' },
  { id: 'jasmine', name: 'Jasmine', category: 'practice', level: 2, note: 'Unit + integration suites' },
  { id: 'karma', name: 'Karma', category: 'practice', level: 2, note: 'Config, reporters, coverage' },
];

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  viz: 'Data Viz',
  styling: 'Styling & UI',
  devops: 'DevOps',
  practice: 'Practices',
};

const CATEGORY_COLOR: Record<SkillCategory, string> = {
  frontend: '#60a5fa',
  viz:      '#f59e0b',
  styling:  '#a78bfa',
  devops:   '#34d399',
  practice: '#f472b6',
};

const RADIUS: Record<1 | 2 | 3, number> = { 1: 28, 2: 38, 3: 52 };

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: SkillCategory;
  level: 1 | 2 | 3;
  r: number;
  note?: string;
}

function readableText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return l > 0.55 ? '#0a0a0f' : '#f8fafc';
}

interface Hover {
  readonly skill: TechSkill;
  readonly x: number;
  readonly y: number;
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

  protected readonly SKILL_COUNT = SKILLS.length;

  protected readonly categories = (
    Object.keys(CATEGORY_LABELS) as SkillCategory[]
  ).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    color: CATEGORY_COLOR[id],
    count: SKILLS.filter((s) => s.category === id).length,
  }));

  protected readonly activeFilter = signal<SkillCategory | null>(null);
  protected readonly hover = signal<Hover | null>(null);
  protected readonly selected = signal<TechSkill | null>(null);

  protected readonly displaySkill = computed<TechSkill | null>(
    () => this.hover()?.skill ?? this.selected(),
  );

  protected readonly stats = computed(() => {
    const filter = this.activeFilter();
    const pool = filter
      ? SKILLS.filter((s) => s.category === filter)
      : SKILLS;
    return {
      total: pool.length,
      expert: pool.filter((s) => s.level === 3).length,
    };
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.initChart());
  }

  protected toggleFilter(cat: SkillCategory): void {
    this.activeFilter.update((current) => (current === cat ? null : cat));
    this.selected.set(null);
    this.applyFilter();
  }

  /** Exposed for the "All" chip, which sets the signal inline in the template. */
  protected applyFilterExternal(): void {
    this.applyFilter();
  }

  protected clearSelection(): void {
    this.selected.set(null);
  }

  private simApi: {
    svg: SVGSVGElement;
    bubble: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>;
  } | null = null;

  private applyFilter(): void {
    if (!this.simApi) return;
    const filter = this.activeFilter();
    this.simApi.bubble
      .transition()
      .duration(240)
      .attr('opacity', (d) => (!filter || d.category === filter ? 1 : 0.12));
  }

  private initChart(): void {
    const svgEl = this.svgRef()?.nativeElement;
    if (!svgEl) return;

    const nodes: SimNode[] = SKILLS.map((s) => ({ ...s, r: RADIUS[s.level] }));

    let sim: d3.Simulation<SimNode, undefined> | null = null;
    let ro: ResizeObserver | null = null;

    const draw = () => {
      const W = Math.max(svgEl.clientWidth || 600, 320);
      const H = W < 640 ? 480 : 440;
      svgEl.setAttribute('height', String(H));
      svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const defs = svg.append('defs');
      const glow = defs
        .append('filter')
        .attr('id', 'bubble-glow')
        .attr('x', '-40%').attr('y', '-40%')
        .attr('width', '180%').attr('height', '180%');
      glow.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'b');
      const m = glow.append('feMerge');
      m.append('feMergeNode').attr('in', 'b');
      m.append('feMergeNode').attr('in', 'SourceGraphic');

      sim?.stop();
      sim = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-30))
        .force(
          'collide',
          d3.forceCollide<SimNode>().radius((d) => d.r + 4).strength(0.92),
        )
        .force('x', d3.forceX(W / 2).strength(0.045))
        .force('y', d3.forceY(H / 2).strength(0.075))
        .alphaDecay(0.022);

      const g = svg.append('g');

      const bubble = g
        .selectAll<SVGGElement, SimNode>('g.bubble')
        .data(nodes)
        .join('g')
        .attr('class', 'bubble')
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', (d) => `${d.name} — ${CATEGORY_LABELS[d.category]} — level ${d.level} of 3`)
        .style('cursor', 'grab');

      bubble
        .filter((d) => d.level === 3)
        .append('circle')
        .attr('class', 'bubble__halo')
        .attr('r', (d) => d.r + 6)
        .attr('fill', (d) => CATEGORY_COLOR[d.category])
        .attr('fill-opacity', 0.2)
        .attr('filter', 'url(#bubble-glow)')
        .style('pointer-events', 'none');

      bubble
        .append('circle')
        .attr('class', 'bubble__circle')
        .attr('r', (d) => d.r)
        .attr('fill', (d) => CATEGORY_COLOR[d.category])
        .attr('fill-opacity', 0.92)
        .attr('stroke', 'rgba(255,255,255,0.14)')
        .attr('stroke-width', 1);

      bubble
        .filter((d) => d.level === 3)
        .append('circle')
        .attr('r', (d) => d.r - 6)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(10,10,15,0.25)')
        .attr('stroke-width', 1)
        .style('pointer-events', 'none');

      bubble
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-weight', 600)
        .attr('font-size', (d) => (d.level === 1 ? 10 : d.level === 2 ? 11.5 : 13))
        .attr('fill', (d) => readableText(CATEGORY_COLOR[d.category]))
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .text((d) => d.name);

      // Hover + scale + tooltip (via Angular signals).
      const hostRect = () => svgEl.getBoundingClientRect();
      bubble
        .on('mouseenter', (event: MouseEvent, d) => {
          const host = hostRect();
          this.zone.run(() => {
            this.hover.set({
              skill: d,
              x: event.clientX - host.left,
              y: event.clientY - host.top,
            });
          });
          d3.select(event.currentTarget as SVGGElement)
            .raise()
            .transition()
            .duration(160)
            .attr('transform', () => {
              const x = Math.max(d.r + 2, Math.min(svgEl.clientWidth - d.r - 2, d.x ?? 0));
              const y = Math.max(d.r + 2, Math.min(parseFloat(svgEl.getAttribute('height') || '440') - d.r - 2, d.y ?? 0));
              return `translate(${x},${y}) scale(1.08)`;
            });
        })
        .on('mousemove', (event: MouseEvent, d) => {
          const host = hostRect();
          this.zone.run(() => {
            this.hover.set({
              skill: d,
              x: event.clientX - host.left,
              y: event.clientY - host.top,
            });
          });
        })
        .on('mouseleave', (event: MouseEvent, d) => {
          this.zone.run(() => this.hover.set(null));
          d3.select(event.currentTarget as SVGGElement)
            .transition()
            .duration(160)
            .attr('transform', () => {
              const x = Math.max(d.r + 2, Math.min(svgEl.clientWidth - d.r - 2, d.x ?? 0));
              const y = Math.max(d.r + 2, Math.min(parseFloat(svgEl.getAttribute('height') || '440') - d.r - 2, d.y ?? 0));
              return `translate(${x},${y})`;
            });
        })
        .on('click', (_event, d) => {
          this.zone.run(() =>
            this.selected.update((s) => (s?.id === d.id ? null : d)),
          );
        });

      const drag = d3
        .drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) sim?.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) sim?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });

      bubble.call(drag);

      sim.on('tick', () => {
        bubble.attr('transform', (d) => {
          const x = Math.max(d.r + 2, Math.min(W - d.r - 2, d.x ?? W / 2));
          const y = Math.max(d.r + 2, Math.min(H - d.r - 2, d.y ?? H / 2));
          return `translate(${x},${y})`;
        });
      });

      this.simApi = { svg: svgEl, bubble };
      this.applyFilter();
    };

    draw();

    ro = new ResizeObserver(() => draw());
    if (svgEl.parentElement) ro.observe(svgEl.parentElement);

    this.destroyRef.onDestroy(() => {
      sim?.stop();
      ro?.disconnect();
    });
  }

  // Template helpers ----------------------------------------------------
  protected colorFor(cat: SkillCategory): string { return CATEGORY_COLOR[cat]; }
  protected labelFor(cat: SkillCategory): string { return CATEGORY_LABELS[cat]; }
  protected levelLabel(l: 1 | 2 | 3): string {
    return l === 3 ? 'Expert' : l === 2 ? 'Proficient' : 'Familiar';
  }
  protected levelSegments(l: 1 | 2 | 3): readonly boolean[] {
    return [l >= 1, l >= 2, l >= 3];
  }
}
