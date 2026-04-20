import { Injectable, inject } from '@angular/core';
import type {
  ContactMessage,
  ContactMessageInsert,
} from '@rahul-dev/shared-types';
import { SUPABASE_CLIENT } from './supabase-client';

const TABLE = 'contact_messages';

@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly #supabase = inject(SUPABASE_CLIENT);

  /** Public insert — anyone can write to contact_messages via RLS. */
  async submit(payload: ContactMessageInsert): Promise<ContactMessage> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as ContactMessage;
  }

  /** Authenticated read — admin inbox. */
  async listAll(): Promise<readonly ContactMessage[]> {
    const { data, error } = await this.#supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as readonly ContactMessage[];
  }

  async markRead(id: string, isRead = true): Promise<void> {
    const { error } = await this.#supabase
      .from(TABLE)
      .update({ is_read: isRead })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.#supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }
}
