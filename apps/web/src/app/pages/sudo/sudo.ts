import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TerminalService } from '@rahul-dev/shared-terminal';

@Component({
  selector: 'app-sudo',
  template: `<p class="sr-only">Opening admin terminal…</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sudo implements OnInit {
  private readonly terminal = inject(TerminalService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.terminal.open();
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
