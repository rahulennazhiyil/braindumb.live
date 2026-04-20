import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TerminalOverlay } from '@rahul-dev/shared-terminal';
import { ThemeToggle } from '@rahul-dev/shared-theme';
import { Footer, NavLink, Navbar, SocialLink } from '@rahul-dev/shared-ui';

@Component({
  imports: [RouterOutlet, Navbar, Footer, ThemeToggle, TerminalOverlay],
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
