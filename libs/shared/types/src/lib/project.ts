/**
 * Matches the `projects` table in Supabase (blueprint §9).
 * All fields other than `id`, `title`, `slug` are optional on the wire.
 */
export interface Project {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly content: string | null;
  readonly tech_tags: readonly string[] | null;
  readonly image_url: string | null;
  readonly live_url: string | null;
  readonly github_url: string | null;
  readonly is_featured: boolean;
  readonly sort_order: number;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export type ProjectInsert = Omit<
  Project,
  'id' | 'created_at' | 'updated_at'
>;

export type ProjectUpdate = Partial<
  Omit<Project, 'id' | 'created_at' | 'updated_at'>
>;
