import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Code2, LucideAngularModule } from 'lucide-angular';
import { SectionHeading, TagChip } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-demo-frame',
  imports: [RouterLink, LucideAngularModule, SectionHeading, TagChip],
  templateUrl: './demo-frame.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFrame {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly summary = input<string>();
  readonly techTags = input<readonly string[]>([]);
  /**
   * Implementation notes revealed via the "view source" toggle. Not the
   * literal file source — a short sketch of the D3 layout calls that make
   * the demo work, meant to explain intent at a glance.
   */
  readonly notes = input<string>();

  protected readonly showNotes = signal(false);
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Code2 = Code2;

  protected toggleNotes(): void {
    this.showNotes.update((v) => !v);
  }
}
