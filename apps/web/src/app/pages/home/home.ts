import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import { TerminalService } from '@rahul-dev/shared-terminal';
import { Button, SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-home',
  imports: [Button, SectionHeading, RouterLink, HeroGraph],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly terminal = inject(TerminalService);

  protected onSecretTriggered(): void {
    this.terminal.open();
  }

  protected onNodeActivated(node: TechNode): void {
    // Future: navigate to case study or filter projects by tag.
    void node;
  }
}
