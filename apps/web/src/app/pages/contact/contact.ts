import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactService } from '@rahul-dev/core-supabase';
import { SceneFrame } from '@rahul-dev/features-scene-frame';
import { DecryptText, KineticHeading } from '@rahul-dev/shared-cinematics';
import { type SocialLink } from '@rahul-dev/shared-ui';
import { map } from 'rxjs';

/**
 * Contact page — also the landing for unauthenticated visitors that the
 * authGuard redirects away from /admin. When the redirect adds
 * `?from=admin`, the page surfaces the "this area is for Rahul" banner.
 */
@Component({
  selector: 'app-contact',
  imports: [FormsModule, DecryptText, KineticHeading, SceneFrame],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly service = inject(ContactService);
  private readonly route = inject(ActivatedRoute);

  protected readonly socials: readonly SocialLink[] = [
    { label: 'GitHub', href: 'https://github.com/rahuledu6', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rahule', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:duboopathi@gmail.com', icon: 'mail' },
  ];

  protected readonly fromAdmin = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('from') === 'admin')),
    { initialValue: false },
  );

  protected readonly contactReady = signal<boolean>(false);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.name().trim().length > 0 &&
      /.+@.+\..+/.test(this.email().trim()) &&
      this.message().trim().length >= 4,
  );

  protected onContactEnter(): void {
    this.contactReady.set(true);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.service.submit({
        name: this.name().trim(),
        email: this.email().trim(),
        message: this.message().trim(),
      });
      this.sent.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Send failed.');
    } finally {
      this.submitting.set(false);
    }
  }
}
