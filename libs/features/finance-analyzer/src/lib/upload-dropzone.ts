import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule, Upload } from 'lucide-angular';

@Component({
  selector: 'app-finance-upload-dropzone',
  imports: [LucideAngularModule],
  templateUrl: './upload-dropzone.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDropzone {
  readonly fileChosen = output<File>();

  private readonly fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly dragging = signal(false);
  protected readonly Upload = Upload;

  protected open(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.fileChosen.emit(file);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.fileChosen.emit(file);
  }
}
