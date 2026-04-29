import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ProjectService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import type { Project } from '@rahul-dev/shared-types';
import { LoadingSkeleton, ProjectCard, Reveal } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-projects-index',
  imports: [
    LoadingSkeleton,
    ProjectCard,
    Reveal,
    DecryptText,
    KineticHeading,
    SceneFrame,
  ],
  templateUrl: './projects-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsIndex {
  protected readonly skeletonItems = Array.from({ length: 6 }, (_, i) => i);
  private readonly service = inject(ProjectService);

  protected readonly items = signal<readonly Project[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly indexReady = signal<boolean>(false);

  /**
   * Featured projects first, then everything else in `sort_order` ascending.
   * `listPublished` already sorts by sort_order; this step promotes featured
   * without disturbing their relative order.
   */
  protected readonly ordered = computed<readonly Project[]>(() => {
    const list = this.items();
    return [...list].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  });

  constructor() {
    void this.refresh();
  }

  /** Prefer live_url → github_url → /projects/:slug for the card link. */
  protected hrefFor(p: Project): { href: string; external: boolean } {
    if (p.live_url) return { href: p.live_url, external: true };
    if (p.github_url) return { href: p.github_url, external: true };
    return { href: `/projects/${p.slug}`, external: false };
  }

  protected onIndexEnter(): void {
    this.indexReady.set(true);
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.listPublished());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }
}
