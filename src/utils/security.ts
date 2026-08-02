/**
 * Password hashing helpers.
 *
 * Context: this app has no application server — the React client talks
 * directly to Firestore, so there is no place to run bcrypt/argon2 and
 * verify credentials out of sight of the browser. Given that constraint,
 * this module makes the *best available* improvement:
 *
 *   - Passwords are never stored or compared in plain text again.
 *   - A SHA-256 digest (with a static app-level pepper) is stored instead.
 *   - Legacy plaintext records already in the database are transparently
 *     migrated to a hash the moment they're next used to log in.
 *
 * This is NOT a substitute for real server-side authentication. SHA-256 is
 * fast, so a leaked database is still brute-forceable offline. The durable
 * fix is to move login behind a Cloud Function (or similar) using
 * bcrypt/argon2 + Firebase Auth custom tokens, so the database never holds
 * anything that verifies a password by itself. Flagging that here so it
 * isn't lost — swapping to that architecture is a larger change than this
 * pass covers, since it requires a deployed backend function.
 */

// App-level pepper. Not a secret in the cryptographic sense (it ships in the
// bundle like everything else in a client-only app) — its only job is to
// stop a stored hash being usable against a generic SHA-256 rainbow table.
const PEPPER = 'salon-mgmt-v1::';

const HASH_PREFIX = 'sha256:';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(PEPPER + input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** True if a stored password value is already a hash produced by this module. */
export function isHashed(stored: string | undefined | null): boolean {
  return !!stored && stored.startsWith(HASH_PREFIX);
}

/** Hash a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return HASH_PREFIX + (await sha256Hex(plain));
}

/**
 * Compare a plaintext attempt against whatever is stored.
 * Handles both already-hashed values and legacy plaintext values
 * (older records / the seeded default admin) so nobody gets locked out
 * during the migration — the caller should re-save the hashed form
 * after a successful legacy match (see `login` in StoreContext).
 */
export async function verifyPassword(attempt: string, stored: string | undefined | null): Promise<boolean> {
  if (!stored) return false;
  if (isHashed(stored)) {
    return (await hashPassword(attempt)) === stored;
  }
  // Legacy plaintext record — compare directly. Caller is responsible for
  // migrating this record to a hash on successful login.
  return attempt === stored;
}
