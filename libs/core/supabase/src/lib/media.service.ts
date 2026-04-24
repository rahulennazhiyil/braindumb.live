import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase-client';

const BUCKET = 'media';

export interface MediaObject {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly uploadedAt: string;
  readonly publicUrl: string;
}

/**
 * Thin wrapper over Supabase Storage for the admin Media page.
 * Expects a public bucket named `media` — create it from Supabase Studio
 * (Storage → New bucket → `media`, public) before use.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  readonly #supabase = inject(SUPABASE_CLIENT);

  async list(): Promise<readonly MediaObject[]> {
    const { data, error } = await this.#supabase.storage
      .from(BUCKET)
      .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw error;
    if (!data) return [];

    return data
      .filter((f) => f.id !== null)
      .map((f) => ({
        name: f.name,
        size: f.metadata?.['size'] ?? 0,
        mimeType: f.metadata?.['mimetype'] ?? 'application/octet-stream',
        uploadedAt: f.created_at ?? '',
        publicUrl: this.publicUrl(f.name),
      }));
  }

  async upload(file: File): Promise<MediaObject> {
    const cleanName = sanitize(file.name);
    const finalName = `${Date.now()}-${cleanName}`;

    const { error } = await this.#supabase.storage
      .from(BUCKET)
      .upload(finalName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (error) throw error;

    return {
      name: finalName,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      publicUrl: this.publicUrl(finalName),
    };
  }

  async remove(name: string): Promise<void> {
    const { error } = await this.#supabase.storage.from(BUCKET).remove([name]);
    if (error) throw error;
  }

  publicUrl(name: string): string {
    return this.#supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
}

function sanitize(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
