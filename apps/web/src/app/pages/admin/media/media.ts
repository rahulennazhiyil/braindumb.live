import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MediaService, type MediaObject } from '@rahul-dev/core-supabase';
import { LoadingSkeleton, SectionHeading } from '@rahul-dev/shared-ui';
import {
  Copy,
  LucideAngularModule,
  Trash2,
  UploadCloud,
} from 'lucide-angular';

type StatusTone = 'info' | 'success' | 'error';

@Component({
  selector: 'app-admin-media',
  imports: [LoadingSkeleton, SectionHeading, LucideAngularModule],
  templateUrl: './media.html',
  styleUrl: './media.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Media {
  private readonly service = inject(MediaService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly UploadCloud = UploadCloud;
  protected readonly Trash2 = Trash2;
  protected readonly Copy = Copy;

  protected readonly items = signal<readonly MediaObject[]>([]);
  protected readonly loading = signal(false);
  protected readonly uploading = signal(false);
  protected readonly dragOver = signal(false);
  protected readonly status = signal<{ tone: StatusTone; text: string } | null>(
    null,
  );
  protected readonly skeletons = Array.from({ length: 6 }, (_, i) => i);

  protected readonly totalSize = computed(() =>
    this.items().reduce((sum, i) => sum + i.size, 0),
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) void this.refresh();
  }

  protected formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log10(bytes) / 3);
    return `${(bytes / 1000 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  protected isImage(mime: string): boolean {
    return mime.startsWith('image/');
  }

  protected trackName(_index: number, item: MediaObject): string {
    return item.name;
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    this.status.set(null);
    try {
      this.items.set(await this.service.list());
    } catch (err) {
      this.status.set({
        tone: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Could not load media. Does the `media` bucket exist?',
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected onFilePick(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    void this.uploadBatch(Array.from(input.files));
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(): void {
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    void this.uploadBatch(Array.from(files));
  }

  private async uploadBatch(files: readonly File[]): Promise<void> {
    this.uploading.set(true);
    this.status.set(null);
    let ok = 0;
    let failed = 0;
    for (const file of files) {
      try {
        await this.service.upload(file);
        ok += 1;
      } catch {
        failed += 1;
      }
    }
    this.uploading.set(false);
    this.status.set({
      tone: failed === 0 ? 'success' : ok === 0 ? 'error' : 'info',
      text: `${ok} uploaded${failed ? ` · ${failed} failed` : ''}.`,
    });
    await this.refresh();
  }

  protected async onDelete(item: MediaObject): Promise<void> {
    const ok =
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined'
        ? window.confirm(`Delete "${item.name}"? This cannot be undone.`)
        : true;
    if (!ok) return;
    try {
      await this.service.remove(item.name);
      this.items.update((list) => list.filter((i) => i.name !== item.name));
      this.status.set({ tone: 'success', text: `Deleted ${item.name}.` });
    } catch (err) {
      this.status.set({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  }

  protected async copyUrl(url: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await navigator.clipboard.writeText(url);
      this.status.set({ tone: 'success', text: 'URL copied to clipboard.' });
    } catch {
      this.status.set({ tone: 'error', text: 'Clipboard blocked.' });
    }
  }
}
