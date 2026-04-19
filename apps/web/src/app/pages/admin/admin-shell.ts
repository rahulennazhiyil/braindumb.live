import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Link as LinkIcon,
  LucideAngularModule,
  LucideIconData,
  Settings as SettingsIcon,
  Wallet,
  Briefcase,
} from 'lucide-angular';

interface AdminNavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIconData;
}

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  templateUrl: './admin-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  protected readonly items: readonly AdminNavItem[] = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'feed-manager', label: 'Feed', icon: FileText },
    { path: 'project-manager', label: 'Projects', icon: Briefcase },
    { path: 'inbox', label: 'Inbox', icon: Inbox },
    { path: 'link-manager', label: 'Links', icon: LinkIcon },
    { path: 'media', label: 'Media', icon: ImageIcon },
    { path: 'visitor-insights', label: 'Insights', icon: BarChart3 },
    { path: 'finance', label: 'Finance', icon: Wallet },
    { path: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
}
