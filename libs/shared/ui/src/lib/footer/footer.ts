import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

  protected iconFor(key: SocialLink['icon']): LucideIconData {
    return ICON_MAP[key];
  }
}
