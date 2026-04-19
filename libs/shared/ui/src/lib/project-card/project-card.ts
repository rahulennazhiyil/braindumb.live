import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowUpRight, LucideAngularModule } from 'lucide-angular';
import { TagChip } from '../tag-chip/tag-chip';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, LucideAngularModule, TagChip, NgTemplateOutlet],
  templateUrl: './project-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly techTags = input<readonly string[]>([]);
  readonly href = input<string>();
  readonly external = input<boolean>(false);

  protected readonly ArrowUpRight = ArrowUpRight;
}
