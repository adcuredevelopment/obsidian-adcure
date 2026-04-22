
Update the `/login` card spacing by changing the spacing at the field-group level, not just the outer `GlassCard`.

1. Refine the card’s internal layout in `src/routes/login.tsx`
   - Keep the existing centered/glass layout.
   - Replace the current “single stack with large `space-y-*`” approach with more deliberate grouped spacing.
   - Add a dedicated inner wrapper for the form content so spacing is controlled independently from card padding.

2. Increase spacing inside each form block
   - Email block: add more separation between label, input, and inline error text.
   - Password block: add more separation between the top row (`Wachtwoord` + forgot link), the input, and the error text.
   - Remember-me row: add more top margin so it no longer feels attached to the password field.
   - Submit button: add more top margin so it reads as a distinct action area.
   - Divider and bottom sign-up text: add more vertical space so the footer content feels separate from the form controls.

3. Tune the exact classes that are currently too tight
   - Increase per-block spacing from the current `space-y-1.5` patterns to larger values.
   - Add section-specific spacing utilities such as `mt-6`, `mt-8`, or `space-y-4/5` where needed instead of relying only on one card-wide `space-y-10`.
   - Preserve the current dark/glass visual style, icons, validation behavior, and button styling.

4. Verify consistency with the existing Obsidian Elite design
   - Keep typography, muted labels, gradient CTA, and glassmorphism unchanged.
   - Make the result feel visually aligned with the improved spacing already used on `/sign-up`, but adapted for the simpler login form.

Technical details
- File to update: `src/routes/login.tsx`
- Likely change areas:
  - `GlassCard` inner structure
  - Email field wrapper
  - Password field wrapper
  - Remember-me row
  - Submit button spacing
  - Divider/footer spacing
- No route or logic changes required; this is a layout-only refinement.

Expected result
- “Email”, “Wachtwoord”, “Onthoud mij”, and “Inloggen” will no longer feel cramped.
- The card will have clearer visual rhythm, with each block reading as its own section instead of one dense stack.
