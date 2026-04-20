import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroGraph, type TechNode } from '@rahul-dev/features-hero-graph';
import { Button, SectionHeading } from '@rahul-dev/shared-ui';

@Component({
  selector: 'app-home',
  imports: [Button, SectionHeading, RouterLink, HeroGraph],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  /**
   * Phase 8 will replace this with the terminal overlay. For now the graph's
   * triple-click on the secret node is a no-op so we don't block users from
   * exploring the visualization.
   */
  protected onSecretTriggered(): void {
    // intentionally empty — Phase 8 wires the terminal login overlay
  }

  protected onNodeActivated(node: TechNode): void {
    // Future: navigate to case study / filter projects by tag.
    void node;
  }
}
