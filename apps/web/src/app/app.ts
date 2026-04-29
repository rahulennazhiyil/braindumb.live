import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import {
  CommandPaletteOverlay,
  CommandPaletteService,
  type Command,
} from '@rahul-dev/shared-command-palette';
import {
  CrosshairCursor,
  GrainOverlay,
  ScanLineOverlay,
  ShakeDetector,
} from '@rahul-dev/shared-cinematics';
import {
  BootGuardService,
  BootSequence,
} from '@rahul-dev/features-boot-sequence';
import { TerminalOverlay, TerminalService } from '@rahul-dev/shared-terminal';
import {
  THEMES,
  ThemeService,
  ThemeToggle,
  ViewSourceService,
  type ThemeName,
} from '@rahul-dev/shared-theme';
import {
  Footer,
  NavLink,
  Navbar,
  OfflineBanner,
  ScrollToTop,
  SocialLink,
} from '@rahul-dev/shared-ui';

@Component({
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    OfflineBanner,
    ScrollToTop,
    CommandPaletteOverlay,
    TerminalOverlay,
    ThemeToggle,
    GrainOverlay,
    ScanLineOverlay,
    BootSequence,
    CrosshairCursor,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly palette = inject(CommandPaletteService);
  private readonly theme = inject(ThemeService);
  private readonly viewSource = inject(ViewSourceService);
  private readonly terminal = inject(TerminalService);
  private readonly bootGuard = inject(BootGuardService);
  private readonly shake = inject(ShakeDetector);
  private readonly destroyRef = inject(DestroyRef);
  private shakeStarted = false;

  protected readonly bootVisible = signal<boolean>(this.bootGuard.shouldPlayLong());

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

  constructor() {
    this.palette.register(this.buildCommands());
    this.shake.shake$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.terminal.open());
  }

  @HostListener('window:pointerdown')
  protected onFirstPointerDown(): void {
    if (this.shakeStarted) return;
    this.shakeStarted = true;
    void this.shake.start();
  }

  protected onLogoLongPress(): void {
    this.terminal.open();
  }

  protected onBootDone(): void {
    this.bootGuard.markPlayed();
    this.bootVisible.set(false);
  }

  protected onBootKonami(): void {
    this.terminal.open();
  }

  protected onReplayIntro(): void {
    this.bootGuard.reset();
    this.bootVisible.set(true);
  }

  private buildCommands(): readonly Command[] {
    const navCommands: Command[] = [
      ...this.navLinks.map<Command>((link) => ({
        id: `nav:${link.href}`,
        label: `Go to ${link.label}`,
        group: 'navigate',
        keywords: [link.href.replace(/^\//, '')],
        run: () => void this.router.navigateByUrl(link.href),
      })),
      {
        id: 'nav:/',
        label: 'Go to Home',
        group: 'navigate',
        keywords: ['home', 'hero'],
        run: () => void this.router.navigateByUrl('/'),
      },
      {
        id: 'nav:/privacy',
        label: 'Go to Privacy policy',
        group: 'navigate',
        keywords: ['privacy', 'policy'],
        run: () => void this.router.navigateByUrl('/privacy'),
      },
    ];

    const themeCommands: Command[] = THEMES.map<Command>((t: ThemeName) => ({
      id: `theme:${t}`,
      label: `Theme: ${t}`,
      group: 'theme',
      keywords: ['theme', t],
      run: () => this.theme.setTheme(t),
    }));

    const actionCommands: Command[] = [
      {
        id: 'action:view-source',
        label: 'Toggle view-source overlay',
        group: 'action',
        keywords: ['source', 'annotate', 'teach'],
        hint: 'overlay',
        run: () => this.viewSource.toggle(),
      },
      {
        id: 'action:admin-login',
        label: 'Open admin terminal',
        group: 'action',
        keywords: ['admin', 'login', 'sudo', 'terminal'],
        hint: 'sudo su',
        run: () => this.terminal.open(),
      },
      {
        id: 'action:replay-intro',
        label: 'Replay intro / boot sequence',
        group: 'action',
        keywords: ['intro', 'boot', 'replay', 'sequence'],
        hint: '~$ replay-intro',
        run: () => this.onReplayIntro(),
      },
    ];

    return [...navCommands, ...themeCommands, ...actionCommands];
  }
}
