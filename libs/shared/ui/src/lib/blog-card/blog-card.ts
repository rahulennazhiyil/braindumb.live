import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowUpRight, LucideAngularModule } from 'lucide-angular';
import { TagChip } from '../tag-chip/tag-chip';

@Component({
  selector: 'app-blog-card',
  imports: [
    RouterLink,
    LucideAngularModule,
    TagChip,
    DatePipe,
    NgTemplateOutlet,
  ],
  templateUrl: './blog-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogCard {
  readonly title = input.required<string>();
  readonly excerpt = input.required<string>();
  readonly publishedAt = input.required<Date | string>();
  readonly tags = input<readonly string[]>([]);
  readonly href = input<string>();
  /** Render the wrapper as a plain <a target="_blank"> for off-site URLs. */
  readonly external = input<boolean>(false);
  readonly readingMinutes = input<number>();

  protected readonly ArrowUpRight = ArrowUpRight;
}
