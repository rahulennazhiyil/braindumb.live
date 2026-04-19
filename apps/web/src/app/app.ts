import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer, NavLink, Navbar, SocialLink } from '@rahul-dev/shared-ui';
import { ThemeToggle } from '@rahul-dev/shared-theme';

@Component({
  imports: [RouterOutlet, Navbar, Footer, ThemeToggle],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly navLinks: readonly NavLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Playground', href: '/playground' },
    { label: 'Feed', href: '/feed' },
    { label: 'Contact', href: '/contact' },
  ];

  protected readonly socials: readonly SocialLink[] = [
    {
      label: 'GitHub',
      href: 'https://github.com/rahuledu6',
      icon: 'github',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/rahule',
      icon: 'linkedin',
    },
    { label: 'Email', href: 'mailto:duboopathi@gmail.com', icon: 'mail' },
  ];
}
