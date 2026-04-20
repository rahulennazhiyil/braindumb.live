import { Injectable, inject } from '@angular/core';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
} from '@rahul-dev/shared-types';
import { SUPABASE_CLIENT } from './supabase-client';

const TABLE = 'projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  readonly #supabase = inject(SUPABASE_CLIENT);

  async listPublished(): Promise<readonly Project[]> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []) as readonly Project[];
  }

  async listAll(): Promise<readonly Project[]> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []) as readonly Project[];
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    return (data as Project | null) ?? null;
  }

  async create(payload: ProjectInsert): Promise<Project> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async update(id: string, patch: ProjectUpdate): Promise<Project> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.#supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }
}
