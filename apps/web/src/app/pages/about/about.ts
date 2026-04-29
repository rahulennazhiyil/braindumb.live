import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CareerTimeline } from '@rahul-dev/features-career-timeline';
import {
  MarqueeBand,
  SceneFrame,
  SceneScrollLock,
} from '@rahul-dev/features-scene-frame';
import { TechBubbles } from '@rahul-dev/features-tech-bubbles';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { Reveal } from '@rahul-dev/shared-ui';
import { Github, Linkedin, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-about',
  imports: [
    Reveal,
    CareerTimeline,
    TechBubbles,
    LucideAngularModule,
    DecryptText,
    KineticHeading,
    SceneFrame,
    SceneScrollLock,
    MarqueeBand,
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly openToOpportunities = signal(true);
  protected readonly Github = Github;
  protected readonly Linkedin = Linkedin;

  protected readonly bioReady = signal<boolean>(false);
  protected readonly careerReady = signal<boolean>(false);
  protected readonly stackReady = signal<boolean>(false);

  protected onBioEnter(): void {
    this.bioReady.set(true);
  }

  protected onCareerEnter(): void {
    this.careerReady.set(true);
  }

  protected onStackEnter(): void {
    this.stackReady.set(true);
  }
}
