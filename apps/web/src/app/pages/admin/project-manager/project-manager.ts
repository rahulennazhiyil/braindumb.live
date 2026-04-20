import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminEmpty,
  AdminToolbar,
  TagInput,
} from '@rahul-dev/features-admin';
import { ProjectService } from '@rahul-dev/core-supabase';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
} from '@rahul-dev/shared-types';
import { SectionHeading } from '@rahul-dev/shared-ui';

interface ProjectDraft {
  title: string;
  slug: string;
  description: string;
  content: string;
  tech_tags: readonly string[];
  image_url: string;
  live_url: string;
  github_url: string;
  is_featured: boolean;
  sort_order: number;
  is_published: boolean;
}

function emptyDraft(): ProjectDraft {
  return {
    title: '',
    slug: '',
    description: '',
    content: '',
    tech_tags: [],
    image_url: '',
    live_url: '',
    github_url: '',
    is_featured: false,
    sort_order: 0,
    is_published: true,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Component({
  selector: 'app-admin-project-manager',
  imports: [FormsModule, SectionHeading, AdminToolbar, AdminEmpty, TagInput],
  templateUrl: './project-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectManager {
  private readonly service = inject(ProjectService);

  protected readonly items = signal<readonly Project[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<ProjectDraft>(emptyDraft());
  protected readonly error = signal<string | null>(null);

  protected readonly isCreating = computed(() => this.editingId() === 'new');
  protected readonly isEditing = computed(() => this.editingId() !== null);

  constructor() {
    void this.refresh();
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.service.listAll());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      this.loading.set(false);
    }
  }

  protected startCreate(): void {
    this.draft.set(emptyDraft());
    this.editingId.set('new');
  }

  protected startEdit(item: Project): void {
    this.draft.set({
      title: item.title,
      slug: item.slug,
      description: item.description ?? '',
      content: item.content ?? '',
      tech_tags: item.tech_tags ?? [],
      image_url: item.image_url ?? '',
      live_url: item.live_url ?? '',
      github_url: item.github_url ?? '',
      is_featured: item.is_featured,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    this.editingId.set(item.id);
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.draft.set(emptyDraft());
    this.error.set(null);
  }

  protected updateDraft<K extends keyof ProjectDraft>(
    key: K,
    value: ProjectDraft[K],
  ): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected onTitleChange(title: string): void {
    this.draft.update((d) => {
      const slug =
        d.slug && this.editingId() !== 'new' ? d.slug : slugify(title);
      return { ...d, title, slug };
    });
  }

  protected async save(): Promise<void> {
    const d = this.draft();
    if (!d.title.trim() || !d.slug.trim()) {
      this.error.set('Title and slug are required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const id = this.editingId();
      const payload: ProjectInsert = {
        title: d.title.trim(),
        slug: d.slug.trim(),
        description: d.description.trim() || null,
        content: d.content.trim() || null,
        tech_tags: d.tech_tags.length > 0 ? d.tech_tags : null,
        image_url: d.image_url.trim() || null,
        live_url: d.live_url.trim() || null,
        github_url: d.github_url.trim() || null,
        is_featured: d.is_featured,
        sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 0,
        is_published: d.is_published,
      };

      if (id === 'new') {
        await this.service.create(payload);
      } else if (id) {
        const update: ProjectUpdate = { ...payload };
        await this.service.update(id, update);
      }
      this.cancel();
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(item: Project): Promise<void> {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await this.service.delete(item.id);
      await this.refresh();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Delete failed.');
    }
  }
}
