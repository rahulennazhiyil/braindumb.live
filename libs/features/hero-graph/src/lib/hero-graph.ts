import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';
import {
  TECH_STACK,
  TechNode,
  TechStackData,
  buildAdjacency,
} from './tech-stack';

// d3-force mutates nodes with x/y/fx/fy; wrap in a local mutable shape.
type SimNode = TechNode & d3.SimulationNodeDatum;
type SimEdge = { source: SimNode; target: SimNode; strength: 1 | 2 | 3 };

const CATEGORY_COLOR: Record<TechNode['category'], string> = {
  framework: 'var(--accent-primary)',
  language: 'var(--accent-primary)',
  viz: 'var(--accent-secondary)',
  infra: 'var(--cat-infra)',
  data: 'var(--cat-data)',
  platform: 'var(--cat-platform)',
  tool: 'var(--text-secondary)',
};

const SECRET_CLICK_WINDOW_MS = 600;

@Component({
  selector: 'app-hero-graph',
  imports: [],
  templateUrl: './hero-graph.html',
  styleUrl: './hero-graph.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroGraph implements AfterViewInit, OnDestroy {
  readonly data = input<TechStackData>(TECH_STACK);
  readonly secretTriggered = output<void>();
  readonly nodeActivated = output<TechNode>();

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly tooltip =
    viewChild.required<ElementRef<HTMLDivElement>>('tooltip');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hoveredId = signal<string | null>(null);
  protected readonly hoveredLabel = computed(() => {
    const id = this.hoveredId();
    if (!id) return '';
    const n = this.data().nodes.find((n) => n.id === id);
    return n ? `${n.label} · lvl ${n.level}` : '';
  });

  private simulation?: d3.Simulation<SimNode, SimEdge>;
  private resizeObserver?: ResizeObserver;
  private clickTimestamps: number[] = [];
  private readonly mouse = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Run the simulation outside Angular — every tick fires requestAnimationFrame
    // and would otherwise trigger unnecessary change detection.
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy(): void {
    this.simulation?.stop();
    this.resizeObserver?.disconnect();
  }

  private init(): void {
    const host = this.host().nativeElement;
    this.draw(host);
    this.resizeObserver = new ResizeObserver(() => this.draw(host));
    this.resizeObserver.observe(host);

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
      this.mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    host.addEventListener('pointermove', onPointerMove);
    this.destroyRef.onDestroy(() =>
      host.removeEventListener('pointermove', onPointerMove),
    );
  }

  private draw(host: HTMLDivElement): void {
    const { width, height } = host.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const data = this.data();
    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const idToNode = new Map(nodes.map((n) => [n.id, n]));
    const edges: SimEdge[] = data.edges
      .map((e) => {
        const source = idToNode.get(e.source);
        const target = idToNode.get(e.target);
        return source && target
          ? { source, target, strength: e.strength }
          : null;
      })
      .filter((e): e is SimEdge => e !== null);

    const adjacency = buildAdjacency(data.edges);

    const root = d3.select(host).selectAll('svg').data([null]);
    const svg = root
      .join('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid slice');

    svg.selectAll('*').remove();

    // Soft glow filter for nodes.
    const defs = svg.append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'hero-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const world = svg.append('g').attr('class', 'world');

    const linkSel = world
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, SimEdge>('line')
      .data(edges)
      .join('line')
      .attr('stroke', 'var(--glass-border)')
      .attr('stroke-width', (d) => d.strength)
      .attr('stroke-opacity', (d) => 0.2 + d.strength * 0.15);

    const nodeGroup = world
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', (d) => `node${d.secret ? ' node-secret' : ''}`)
      .style('cursor', 'grab');

    nodeGroup
      .append('circle')
      .attr('r', (d) => 6 + d.level * 3)
      .attr('fill', (d) => CATEGORY_COLOR[d.category])
      .attr('fill-opacity', (d) => (d.secret ? 0.25 : 0.85))
      .attr('stroke', 'var(--bg-primary)')
      .attr('stroke-width', 1.5)
      .attr('filter', (d) => (d.secret ? null : 'url(#hero-glow)'));

    nodeGroup
      .append('text')
      .attr('y', (d) => 6 + d.level * 3 + 14)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', 10)
      .attr('fill', (d) =>
        d.secret ? 'var(--text-muted)' : 'var(--text-secondary)',
      )
      .text((d) => d.label);

    // Drag behavior.
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) this.simulation?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    nodeGroup.call(drag);

    // Hover highlight via adjacency.
    const tooltipEl = this.tooltip().nativeElement;
    nodeGroup
      .on('pointerenter', function (event: PointerEvent, d) {
        // Scale + accent stroke on the hovered node for a crisp affordance.
        d3.select(this).classed('hot', true).raise();
        d3.select(this)
          .select('circle')
          .transition()
          .duration(160)
          .attr('r', 8 + d.level * 3.3)
          .attr('stroke', 'var(--accent-primary)')
          .attr('stroke-width', 2);
      })
      .on('pointerenter.ctx', (event: PointerEvent, d) => {
        this.zone.run(() => this.hoveredId.set(d.id));
        const neighbors = adjacency.get(d.id) ?? new Set();
        nodeGroup.classed(
          'dim',
          (n) => n.id !== d.id && !neighbors.has(n.id),
        );
        linkSel.classed(
          'dim',
          (e) =>
            (e.source as SimNode).id !== d.id &&
            (e.target as SimNode).id !== d.id,
        );
        const rect = host.getBoundingClientRect();
        tooltipEl.style.left = `${event.clientX - rect.left + 12}px`;
        tooltipEl.style.top = `${event.clientY - rect.top + 12}px`;
        tooltipEl.style.opacity = '1';
      })
      .on('pointerleave', function (_event: PointerEvent, d) {
        d3.select(this).classed('hot', false);
        d3.select(this)
          .select('circle')
          .transition()
          .duration(160)
          .attr('r', 6 + d.level * 3)
          .attr('stroke', 'var(--bg-primary)')
          .attr('stroke-width', 1.5);
      })
      .on('pointerleave.ctx', () => {
        this.zone.run(() => this.hoveredId.set(null));
        nodeGroup.classed('dim', false);
        linkSel.classed('dim', false);
        tooltipEl.style.opacity = '0';
      })
      .on('click', (_event, d) => this.onNodeClick(d));

    // Force simulation.
    this.simulation?.stop();
    this.simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimEdge>(edges)
          .id((d) => d.id)
          .distance((e) => 70 + (4 - e.strength) * 30)
          .strength((e) => 0.2 + e.strength * 0.1),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius((d) => 14 + d.level * 3),
      );

    this.simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);
      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      // Parallax — translate world by a fraction of mouse offset.
      world.attr(
        'transform',
        `translate(${this.mouse.x * 24},${this.mouse.y * 16})`,
      );
    });
  }

  private onNodeClick(node: SimNode): void {
    if (node.secret) {
      const now = Date.now();
      this.clickTimestamps = this.clickTimestamps.filter(
        (t) => now - t < SECRET_CLICK_WINDOW_MS,
      );
      this.clickTimestamps.push(now);
      if (this.clickTimestamps.length >= 3) {
        this.clickTimestamps = [];
        this.zone.run(() => this.secretTriggered.emit());
      }
      return;
    }
    this.zone.run(() => this.nodeActivated.emit(node));
  }
}
