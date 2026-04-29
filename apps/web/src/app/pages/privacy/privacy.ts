import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, DecryptText, KineticHeading, SceneFrame],
  templateUrl: './privacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {
  protected readonly privacyReady = signal<boolean>(false);

  protected onPrivacyEnter(): void {
    this.privacyReady.set(true);
  }
}
