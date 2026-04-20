/**
 * Matches the `contact_messages` table in Supabase (blueprint §9).
 */
export interface ContactMessage {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly is_read: boolean;
  readonly created_at: string;
}

export type ContactMessageInsert = Pick<
  ContactMessage,
  'name' | 'email' | 'message'
>;
