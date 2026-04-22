
## Forgot password — handle unregistered emails

Right now the form accepts any valid-looking email and always shows the success screen, regardless of whether the address exists. We'll keep that behavior (it's the secure default) but make the messaging explicit so users understand what's happening.

### What changes

**1. Update the success screen copy in `src/routes/forgot-password.tsx`**

Replace the current "We hebben je een reset link gestuurd" / "Check je email voor de reset link" messaging with a neutral, security-conscious version that does not confirm or deny whether the email exists in our system.

- Heading: `"Check je inbox"`
- Subtitle: `"Als er een account bestaat, ontvang je een reset link"`
- Body inside the card:
  - Primary line: `"Als het email adres bij ons bekend is, ontvang je binnen enkele minuten een link om je wachtwoord opnieuw in te stellen."`
  - Secondary line: `"Geen email ontvangen? Controleer je spam folder of probeer het opnieuw met een ander adres."`
  - Keep the "Verstuurd naar [email]" line removed (it implies the address was valid in our system).
- Keep the green `CheckCircle2` icon and the "Terug naar inloggen" link.

**2. Why we are NOT checking existence against the database**

This is the recommended industry-standard pattern (used by Google, GitHub, Stripe, Supabase Auth, etc.):

- Returning "email not found" leaks which addresses are registered → **user enumeration attack**. An attacker can probe the form to build a list of valid customer emails for phishing/credential-stuffing.
- The neutral message ("if an account exists…") protects user privacy while still being helpful to legitimate users.
- When we wire this up to real Supabase Auth later, `supabase.auth.resetPasswordForEmail()` already follows this exact pattern — it always returns success regardless of whether the email exists.

**3. Add a small note below the card (optional polish)**

Replace the current "Beschermd door enterprise-grade encryptie." footer line on the success state with: `"Voor je veiligheid bevestigen we niet of een email adres bij ons geregistreerd is."`

(Keep the original encryption line on the form state.)

### Files touched

- `src/routes/forgot-password.tsx` — copy changes only inside the `submitted` branch and the subtitle. No logic changes, no new dependencies, no backend calls.

### Out of scope

- Real Supabase Auth integration (no auth backend is wired up yet — the form is still a mock with `setTimeout`). When auth is added later, `supabase.auth.resetPasswordForEmail(email)` plugs in directly without changing this UX.
- Rate limiting / captcha (belongs with the real auth integration).
