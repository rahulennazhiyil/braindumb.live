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
import {
  SectionHeading,
  type SocialLink,
} from '@rahul-dev/shared-ui';
import { map } from 'rxjs';

/**
 * Contact page — blueprint §5.6. Also the landing for unauthenticated
 * visitors that the authGuard redirects away from /admin. When the
 * redirect adds `?from=admin`, the page surfaces the "this area is for
 * Rahul" banner called out in the blueprint; otherwise it's just the
 * regular form + socials.
 */
@Component({
  selector: 'app-contact',
  imports: [FormsModule, SectionHeading],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly service = inject(ContactService);
  private readonly route = inject(ActivatedRoute);

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

  // Wrap the arriving-from-admin-guard path so the template can react.
  protected readonly fromAdmin = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('from') === 'admin')),
    { initialValue: false },
  );

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
