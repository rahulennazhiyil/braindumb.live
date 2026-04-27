import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Github,
  Linkedin,
  LucideAngularModule,
  LucideIconData,
  Mail,
  Twitter,
} from 'lucide-angular';

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: 'github' | 'linkedin' | 'mail' | 'twitter';
}

const ICON_MAP: Record<SocialLink['icon'], LucideIconData> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  twitter: Twitter,
};

const TRIPLE_TAP_WINDOW_MS = 700;

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly socials = input<readonly SocialLink[]>([]);
  readonly year = input<number>(new Date().getFullYear());
  readonly tagline = input<string>('Built with Angular, D3.js, and too much coffee.');
  readonly secretTriggered = output<void>();

  private taps: number[] = [];

  protected iconFor(key: SocialLink['icon']): LucideIconData {
    return ICON_MAP[key];
  }

  /** Fires `secretTriggered` after 3 taps on the prompt within 700ms. */
  protected onPromptTap(): void {
    const now = Date.now();
    this.taps = this.taps.filter((t) => now - t < TRIPLE_TAP_WINDOW_MS);
    this.taps.push(now);
    if (this.taps.length >= 3) {
      this.taps = [];
      this.secretTriggered.emit();
    }
  }
}
